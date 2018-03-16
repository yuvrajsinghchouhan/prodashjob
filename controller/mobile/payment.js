module.exports = function (io) {

    var moment = require("moment");
    var db = require('../adaptor/mongodb.js');
    var push = require('../../model/pushNotification.js')(io);
    var multer = require('multer');
    var async = require("async");
    var mail = require('../../model/mail.js');
    var mongoose = require("mongoose");
    var fs = require('fs');
    var CONFIG = require('../../config/config');
    var stripe = require('stripe')('sk_test_1aQzKO9htQAEqlFPvigo717t');
    var url = require('url');
    var twilio = require('../../model/twilio.js');
    var library = require('../../model/library.js');
    var mailcontent = require('../../model/mailcontent.js');


    var controller = {};
    controller.byCash = function (req, res) {
        var data = {};
        data.status = '0';
        var errors = [];
        req.checkBody('job_id', 'Job ID is Required').notEmpty();
        req.checkBody('user_id', 'User ID is Required').notEmpty();
        errors = req.validationErrors();
        if (errors) {
            res.send({
                "status": "0",
                "errors": errors[0].msg
            });
            return;
        }
        var user_id = req.body.user_id;
        var job_id = req.body.job_id;
        db.GetDocument('users', { '_id': user_id }, {}, {}, function (usersErr, usersRespo) {
            if (usersErr || !usersRespo) {
                data.response = 'Invalid  User';
                res.send(data);
            } else {
                db.GetDocument('task', { 'booking_id': job_id, 'user': user_id, "status": 6 }, {}, {}, function (bookErr, bookRespo) {
                    if (bookErr || bookRespo.length == 0) {
                        data.response = 'Payment is already completed';
                        res.send(data);
                    } else {
                        db.GetDocument('tasker', { '_id': bookRespo[0].tasker }, {}, {}, function (proErr, proRespo) {
                            if (proErr || proRespo.length == 0) {
                                data.response = 'Invalid Tasker';
                                res.send(data);
                            } else {
                                db.GetOneDocument('currencies', { 'default': 1 }, {}, {}, function (err, currencies) {
                                    if (err || !currencies) {
                                        res.send({
                                            "status": 0,
                                            "message": 'Error'
                                        });
                                    }
                                    else {
                                        db.GetOneDocument('settings', { 'alias': 'sms' }, {}, {}, function (err, settings) {
                                            if (err || !settings) {
                                                data.response = 'Configure your website settings';
                                                res.send(data);
                                            } else {
                                                if (bookRespo[0].invoice.amount.grand_total) {
                                                    if (bookRespo[0].invoice.amount.balance_amount) {
                                                        amount_to_receive = (bookRespo[0].invoice.amount.balance_amount).toFixed(2);
                                                    }
                                                    else {
                                                        amount_to_receive = (bookRespo[0].invoice.amount.grand_total).toFixed(2);
                                                    }
                                                }
                                                var transaction = {
                                                    'user': user_id,
                                                    'tasker': bookRespo[0].tasker,
                                                    'task': bookRespo[0]._id,
                                                    'type': 'pay by cash',
                                                    'amount': amount_to_receive,
                                                    'task_date': bookRespo[0].createdAt,
                                                    'status': 1
                                                };
                                                db.InsertDocument('transaction', transaction, function (err, transaction) {
                                                    if (err || transaction.nModified == 0) { data.response = 'Error in data, Please check your data'; res.send(data); }
                                                    else {
                                                        var transactions = [transaction._id];
                                                        db.UpdateDocument('task', { 'booking_id': job_id, 'user': user_id }, { $push: { transactions }, 'invoice.status': 1, 'status': 7, 'payment_type': 'cash', 'history.job_closed_time': new Date() }, {}, function (err, upda) {
                                                            var provider_id = bookRespo[0].tasker;
                                                            var message = CONFIG.NOTIFICATION.PAYMENT_COMPLETED;
                                                            var amount_to_receive = 0.00;
                                                            var currency = currencies.code;
                                                            var options = {
                                                                'job_id': req.body.job_id,
                                                                'provider_id': provider_id,
                                                                'amount': amount_to_receive,
                                                                'currency': currency
                                                            };

                                                            push.sendPushnotification(bookRespo[0].user, message, 'payment_paid', 'ANDROID', options, 'USER', function (err, Response, body) { });
                                                            push.sendPushnotification(bookRespo[0].tasker, message, 'payment_paid', 'ANDROID', options, 'PROVIDER', function (err, Response, body) { });

                                                            data.status = '1';
                                                            data.response = 'Pay your bill by cash';
                                                            res.send(data);
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    controller.byZero = function (req, res) {
        var errors = [];
        req.checkBody('job_id', 'Job ID is Required').notEmpty();
        req.checkBody('user_id', 'User ID is Required').notEmpty();
        errors = req.validationErrors();
        if (errors) {
            res.send({
                "status": "0",
                "errors": errors[0].msg
            });
            return;
        }
        var data = {};
        data.user_id = req.body.user_id;
        data.job_id = req.body.job_id;
        db.GetOneDocument('users', { '_id': req.body.user_id, 'status': 1 }, {}, {}, function (err, user) {
            if (err || !user) {
                res.send({
                    'status': '0',
                    'response': 'INVALID USER'
                });
            } else {
                db.GetOneDocument('task', { 'booking_id': req.body.job_id, 'user': req.body.user_id }, {}, {}, function (bookErr, bookRespo) {
                    if (bookErr || !bookRespo) {
                        res.send({
                            'status': '0',
                            'response': 'INVALID ERROR'
                        });
                    } else {
                        if (bookRespo.status == 6) {
                            db.UpdateDocument('task', { 'booking_id': req.body.job_id, 'user': req.body.user_id }, { 'status': 7, 'invoice.status': 1 }, {}, function (err, response) {
                                if (err || response.nModified == 0) {
                                    res.send({
                                        'status': '0',
                                        'response': 'INVALID ERROR'
                                    });
                                }
                                else {
                                    var message = CONFIG.NOTIFICATION.YOUR_BILLING_AMOUNT_PAID_SUCCESSFULLY;
                                    var options = { 'job_id': data.job_id, 'user_id': data.user_id };
                                    push.sendPushnotification(bookRespo.user, message, 'payment_paid', 'ANDROID', options, 'USER', function (err, response, body) { });

                                    var message = CONFIG.NOTIFICATION.YOUR_BILLING_AMOUNT_PAID_SUCCESSFULLY;
                                    var options = { 'job_id': data.job_id, 'user_id': data.user_id };
                                    push.sendPushnotification(bookRespo.tasker, message, 'payment_paid', 'ANDROID', options, 'PROVIDER', function (err, response, body) { });
                                    res.send({
                                        'status': '1',
                                        'response': 'Payment Completed'
                                    });
                                }
                            });

                        } else {
                            res.send({
                                'status': '0',
                                'response': 'Sorry you can not make payment at this time'
                            });
                        }
                    }
                });
            }
        });
    }


    /*
        controller.stripePaymentProcess = function (req, res) {

            var data = {};
            data.status = '0';
            var errors = [];
            req.checkBody('task_id', 'Job ID is Required').notEmpty();
            req.checkBody('user_id', 'User ID is Required').notEmpty();
            req.checkBody('card_number', 'Card_number is Required').notEmpty();
            req.checkBody('exp_month', 'Exp_month  is Required').notEmpty();
            req.checkBody('exp_year', 'Exp_year is Required').notEmpty();
            req.checkBody('cvc_number', 'Card_cvv no is Required').notEmpty();
            req.checkBody('transaction_id', 'Transaction_id no is Required').notEmpty();
            errors = req.validationErrors();
            if (errors) {
                res.send({
                    "status": "0",
                    "errors": errors[0].msg
                });
                return;
            }
            req.sanitizeBody('task_id').trim();
            req.sanitizeBody('user_id').trim();
            req.sanitizeBody('card_number').trim();
            req.sanitizeBody('exp_month').trim();
            req.sanitizeBody('exp_year').trim();
            req.sanitizeBody('cvc_number').trim();
            req.sanitizeBody('transaction_id').trim();
            var request = {};

            request.task = req.body.task_id.replace(/^"(.*)"$/, '$1');
            request.user = req.body.user_id.replace(/^"(.*)"$/, '$1');
            request.transaction_id = req.body.transaction_id.replace(/^"(.*)"$/, '$1');
            var card = {};
            card.number = req.body.card_number;
            card.exp_month = req.body.exp_month;
            card.exp_year = req.body.exp_year;
            card.cvc = req.body.cvc_number;
            async.waterfall([
                function (callback) {
                    db.GetOneDocument('task', { '_id': request.task, 'status': 6 }, {}, {}, function (err, task) {
                        if (err || !task) {
                            data.response = 'Payment is already completed'; res.send(data);
                        }
                        else { callback(err, task); }
                    });
                },
                function (task, callback) {
                    db.GetOneDocument('tasker', { '_id': task.tasker }, {}, {}, function (err, tasker) {
                        if (err || !tasker) {
                            data.response = 'Invalid Tasker'; res.send(data);
                        }
                        else { callback(err, task, tasker); }
                    });
                },
                function (task, tasker, callback) {
                    db.GetOneDocument('users', { '_id': request.user }, {}, {}, function (err, user) {
                        if (err || !user) {
                            data.response = 'Invalid User'; res.send(data);
                        }
                        else { callback(err, task, tasker, user); }
                    });
                },
                function (task, tasker, user, callback) {
                    stripe.tokens.create({ card: card }, function (err, token) {
                        if (err || !token) {
                            res.redirect("http://" + req.headers.host + '/mobile/mobile/failed');
                        }
                        else { callback(err, token, task, tasker); }
                    });
                },
                function (token, task, tasker, callback) {
                    var amount_to_receive = 0;
                    if (task.invoice.amount.grand_total) {
                        if (task.invoice.amount.balance_amount) {
                            amount_to_receive = parseFloat(task.invoice.amount.balance_amount).toFixed(2);
                        }
                        else {
                            amount_to_receive = parseFloat(task.invoice.amount.grand_total).toFixed(2);
                        }
                    }

                    var test = parseInt(amount_to_receive * 100);
                    stripe.charges.create({
                        amount: test,
                        currency: "usd",
                        source: token.id,
                        description: "Payment From User",
                    }, function (err, charges) {
                        if (err || !charges) {
                            data.response = 'Error in stripe charge creation'; res.send(data);
                        }
                        else { callback(err, task, tasker, token, charges); }
                    });
                },
                function (task, tasker, token, charges, callback) {
                    var transactions = [{
                        'gateway_response': charges
                    }];
                    db.UpdateDocument('transaction', { '_id': request.transaction_id }, { 'transactions': transactions, 'status': 1 }, {}, function (err, transaction) {
                        if (err || transaction.nModified == 0) { data.response = 'Error in saving your data'; res.send(data); }
                        else { callback(err, task, tasker, token, charges); }
                    });
                }
            ], function (err, task, tasker, token, charges) {
                if (err) {
                    if (err) { data.response = 'Error in saving your data'; res.send(data); }
                } else {
                    var dataToUpdate = {};
                    dataToUpdate.status = 7;
                    dataToUpdate.invoice = task.invoice;
                    dataToUpdate.invoice.status = 1;
                    dataToUpdate.invoice.amount.balance_amount = 0;
                    dataToUpdate.payment_type = 'stripe';

                    db.UpdateDocument('task', { _id: task._id }, dataToUpdate, function (err, docdata) {
                        if (err || docdata.nModified == 0) { data.response = 'Error in saving your data'; res.send(data); }
                        else {
                            var transactions = [request.transaction_id];
                            db.UpdateDocument('task', { _id: task._id }, { $push: { transactions } }, function (err, docdata) {
                                if (err || docdata.nModified == 0) { res.redirect("http://" + req.headers.host + '/mobile/payment/pay-failed'); }
                                else {
                                    db.UpdateDocument('task', { _id: task._id }, { 'history.job_closed_time': new Date() }, {}, function (err, history) {
                                        if (err) {
                                            res.status(400).send(err);
                                        } else {
                                            var message = CONFIG.NOTIFICATION.PAYMENT_COMPLETED;
                                            var options = { 'job_id': task.booking_id, 'provider_id': task.tasker };
                                            push.sendPushnotification(task.user, message, 'payment_paid', 'ANDROID', options, 'USER', function (err, Response, body) { });
                                            push.sendPushnotification(task.tasker, message, 'payment_paid', 'ANDROID', options, 'PROVIDER', function (err, Response, body) { });
                                            res.redirect("http://" + req.headers.host + '/mobile/payment/pay-completed/bycard');
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    */

    controller.stripePaymentProcess = function (req, res) {

        var data = {};
        data.status = '0';
        var errors = [];
        req.checkBody('task_id', 'Job ID is Required').notEmpty();
        req.checkBody('user_id', 'User ID is Required').notEmpty();
        req.checkBody('card_number', 'Card_number is Required').notEmpty();
        req.checkBody('exp_month', 'Exp_month  is Required').notEmpty();
        req.checkBody('exp_year', 'Exp_year is Required').notEmpty();
        req.checkBody('cvc_number', 'Card_cvv no is Required').notEmpty();
        req.checkBody('transaction_id', 'Transaction_id no is Required').notEmpty();
        errors = req.validationErrors();
        if (errors) {
            res.send({
                "status": "0",
                "errors": errors[0].msg
            });
            return;
        }
        req.sanitizeBody('task_id').trim();
        req.sanitizeBody('user_id').trim();
        req.sanitizeBody('card_number').trim();
        req.sanitizeBody('exp_month').trim();
        req.sanitizeBody('exp_year').trim();
        req.sanitizeBody('cvc_number').trim();
        req.sanitizeBody('transaction_id').trim();
        var request = {};

        request.task = req.body.task_id.replace(/^"(.*)"$/, '$1');
        request.user = req.body.user_id.replace(/^"(.*)"$/, '$1');
        request.transaction_id = req.body.transaction_id.replace(/^"(.*)"$/, '$1');
        var card = {};
        card.number = req.body.card_number;
        card.exp_month = req.body.exp_month;
        card.exp_year = req.body.exp_year;
        card.cvc = req.body.cvc_number;
        async.waterfall([
            function (callback) {
                db.GetOneDocument('task', { '_id': request.task, 'status': 6 }, {}, {}, function (err, task) {
                    if (err || !task) {
                        data.response = 'Payment is already completed'; res.send(data);
                    }
                    else { callback(err, task); }
                });
            },
            function (task, callback) {
                db.GetOneDocument('tasker', { '_id': task.tasker }, {}, {}, function (err, tasker) {
                    if (err || !tasker) {
                        data.response = 'Invalid Tasker'; res.send(data);
                    }
                    else { callback(err, task, tasker); }
                });
            },
            function (task, tasker, callback) {
                db.GetOneDocument('users', { '_id': request.user }, {}, {}, function (err, user) {
                    if (err || !user) {
                        data.response = 'Invalid User'; res.send(data);
                    }
                    else { callback(err, task, tasker, user); }
                });
            },
            function (task, tasker, user, callback) {
                stripe.tokens.create({ card: card }, function (err, token) {
                    if (err || !token) {
                        res.redirect("http://" + req.headers.host + '/mobile/mobile/failed');
                    }
                    else { callback(err, token, task, tasker); }
                });
            },
            function (token, task, tasker, callback) {
                var amount_to_receive = 0;
                if (task.invoice.amount.grand_total) {
                    if (task.invoice.amount.balance_amount) {
                        amount_to_receive = parseFloat(task.invoice.amount.balance_amount).toFixed(2);
                    } else {
                        amount_to_receive = parseFloat(task.invoice.amount.grand_total).toFixed(2);
                    }
                }
                var test = parseInt(amount_to_receive * 100);
                stripe.charges.create({
                    amount: test,
                    currency: "usd",
                    source: token.id,
                    description: "Payment From User",
                }, function (err, charges) {
                    if (err || !charges) {
                        data.response = 'Error in stripe charge creation'; res.send(data);
                    } else {
                        callback(err, task, tasker, token, charges);
                    }
                });
            },
            function (task, tasker, token, charges, callback) {
                var transactions = [{
                    'gateway_response': charges
                }];
                db.UpdateDocument('transaction', { '_id': request.transaction_id }, { 'transactions': transactions, 'status': 1 }, {}, function (err, transaction) {
                    if (err || transaction.nModified == 0) {
                        data.response = 'Error in saving your data'; res.send(data);
                    }
                    else {
                        callback(err, task, tasker, token, charges);
                    }
                });
            }
        ], function (err, task, tasker, token, charges) {
            if (err) {
                if (err) { data.response = 'Error in saving your data'; res.send(data); }
            } else {
                var dataToUpdate = {};
                dataToUpdate.status = 7;
                dataToUpdate.invoice = task.invoice;
                dataToUpdate.invoice.status = 1;
                dataToUpdate.invoice.amount.balance_amount = 0;
                dataToUpdate.payment_type = 'stripe';

                db.UpdateDocument('task', { _id: task._id }, dataToUpdate, function (err, docdata) {
                    if (err || docdata.nModified == 0) { data.response = 'Error in saving your data'; res.send(data); }
                    else {
                        var transactions = [request.transaction_id];
                        db.UpdateDocument('task', { _id: task._id }, { $push: { transactions } }, function (err, docdata) {
                            if (err || docdata.nModified == 0) { res.redirect("http://" + req.headers.host + '/mobile/payment/pay-failed'); }
                            else {
                                db.UpdateDocument('task', { _id: task._id }, { 'history.job_closed_time': new Date() }, {}, function (err, history) {
                                    if (err) {
                                        res.status(400).send(err);
                                    } else {
                                        var message = CONFIG.NOTIFICATION.PAYMENT_COMPLETED;
                                        var options = { 'job_id': task.booking_id, 'provider_id': task.tasker };
                                        push.sendPushnotification(task.user, message, 'payment_paid', 'ANDROID', options, 'USER', function (err, Response, body) { });
                                        push.sendPushnotification(task.tasker, message, 'payment_paid', 'ANDROID', options, 'PROVIDER', function (err, Response, body) { });
                                        res.redirect("http://" + req.headers.host + '/mobile/payment/pay-completed/bycard');

                                        // email templete
                                        db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settings) {
                                            if (err || !settings) {
                                                data.response = 'Configure your website settings';
                                                res.send(data);
                                            } else {
                                                var options = {};
                                                options.populate = 'tasker user categories';
                                                db.GetOneDocument('task', { _id: request.task }, {}, options, function (err, maildocdata) {
                                                    if (err) {
                                                        data.response = 'Invalid Tasker'; res.send(data);
                                                    } else {

                                                        db.GetOneDocument('currencies', { 'default': 1 }, {}, {}, function (err, currencies) {
                                                            if (err) {
                                                                res.send(err);
                                                            } else {
                                                                var MaterialFee, CouponCode, DateTime, BookingDate;
                                                                if (maildocdata.invoice.amount.extra_amount) {
                                                                    MaterialFee = (maildocdata.invoice.amount.extra_amount).toFixed(2);
                                                                } else {
                                                                    MaterialFee = '0.00';
                                                                }
                                                                if (maildocdata.invoice.amount.coupon) {
                                                                    CouponCode = maildocdata.invoice.amount.coupon;
                                                                } else {
                                                                    CouponCode = 'Not assigned';
                                                                }
                                                                DateTime = moment(maildocdata.history.job_started_time).format('DD/MM/YYYY - HH:mm');
                                                                BookingDate = moment(maildocdata.history.booking_date).format('DD/MM/YYYY');

                                                                var mailData = {};
                                                                mailData.template = 'PaymentDetailstoAdmin';
                                                                mailData.to = settings.settings.email_address;
                                                                mailData.html = [];
                                                                mailData.html.push({ name: 'mode', value: maildocdata.payment_type });
                                                                mailData.html.push({ name: 'materialfee', value: currencies.symbol + ' ' + MaterialFee });
                                                                mailData.html.push({ name: 'coupon', value: CouponCode });
                                                                mailData.html.push({ name: 'datetime', value: DateTime });
                                                                mailData.html.push({ name: 'bookingdata', value: BookingDate });
                                                                mailData.html.push({ name: 'site_url', value: settings.settings.site_url });
                                                                mailData.html.push({ name: 'site_title', value: settings.settings.site_title });
                                                                mailData.html.push({ name: 'logo', value: settings.settings.logo });
                                                                mailData.html.push({ name: 't_username', value: maildocdata.tasker.name.first_name + "(" + maildocdata.tasker.username + ")" });
                                                                mailData.html.push({ name: 'taskeraddress', value: maildocdata.tasker.address.line1 });
                                                                mailData.html.push({ name: 'taskeraddress1', value: maildocdata.tasker.address.city });
                                                                mailData.html.push({ name: 'taskeraddress2', value: maildocdata.tasker.address.state });
                                                                mailData.html.push({ name: 'bookingid', value: maildocdata.booking_id });
                                                                mailData.html.push({ name: 'u_username', value: maildocdata.user.name.first_name + "(" + maildocdata.user.username + ")" });
                                                                mailData.html.push({ name: 'useraddress', value: maildocdata.user.address.line1 });
                                                                mailData.html.push({ name: 'useraddress1', value: maildocdata.user.address.city });
                                                                mailData.html.push({ name: 'useraddress2', value: maildocdata.user.address.state });
                                                                mailData.html.push({ name: 'categoryname', value: maildocdata.booking_information.work_type });
                                                                mailData.html.push({ name: 'hourlyrates', value: currencies.symbol + ' ' + (maildocdata.hourly_rate).toFixed(2) });
                                                                mailData.html.push({ name: 'totalhour', value: currencies.symbol + ' ' + maildocdata.invoice.worked_hours_human });
                                                                mailData.html.push({ name: 'totalamount', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.grand_total).toFixed(2) });
                                                                mailData.html.push({ name: 'total', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.total).toFixed(2) });
                                                                mailData.html.push({ name: 'amount', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.grand_total - maildocdata.invoice.amount.admin_commission).toFixed(2) });
                                                                mailData.html.push({ name: 'actualamount', value: currencies.symbol + ' ' + ((maildocdata.invoice.amount.grand_total - maildocdata.invoice.amount.admin_commission) - MaterialFee).toFixed(2) });
                                                                mailData.html.push({ name: 'adminamount', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.admin_commission).toFixed(2) });
                                                                mailData.html.push({ name: 'privacy', value: settings.settings.site_url + 'pages/privacypolicy' });
                                                                mailData.html.push({ name: 'terms', value: settings.settings.site_url + 'pages/termsandconditions' });
                                                                mailData.html.push({ name: 'Servicetax', value: currencies.symbol + ' ' + maildocdata.invoice.amount.service_tax.toFixed(2) });
                                                                mailcontent.sendmail(mailData, function (err, response) { });

                                                                var mailData2 = {};
                                                                mailData2.template = 'PaymentDetailstoTasker';
                                                                mailData2.to = maildocdata.tasker.email;
                                                                mailData2.html = [];
                                                                mailData2.html.push({ name: 'mode', value: maildocdata.payment_type });
                                                                mailData2.html.push({ name: 'coupon', value: CouponCode });
                                                                mailData2.html.push({ name: 'bookingdata', value: BookingDate });
                                                                mailData2.html.push({ name: 'datetime', value: DateTime });
                                                                mailData2.html.push({ name: 'materialfee', value: currencies.symbol + ' ' + MaterialFee });
                                                                mailData2.html.push({ name: 'site_url', value: settings.settings.site_url });
                                                                mailData2.html.push({ name: 'site_title', value: settings.settings.site_title });
                                                                mailData2.html.push({ name: 'logo', value: settings.settings.logo });
                                                                mailData2.html.push({ name: 't_username', value: maildocdata.tasker.name.first_name + "(" + maildocdata.tasker.username + ")" });
                                                                mailData2.html.push({ name: 'taskeraddress', value: maildocdata.tasker.address.line1 });
                                                                mailData2.html.push({ name: 'taskeraddress1', value: maildocdata.tasker.address.city });
                                                                mailData2.html.push({ name: 'taskeraddress2', value: maildocdata.tasker.address.state });
                                                                mailData2.html.push({ name: 'bookingid', value: maildocdata.booking_id });
                                                                mailData2.html.push({ name: 'u_username', value: maildocdata.user.name.first_name + "(" + maildocdata.user.username + ")" });
                                                                mailData2.html.push({ name: 'useraddress', value: maildocdata.user.address.line1 });
                                                                mailData2.html.push({ name: 'useraddress1', value: maildocdata.user.address.city });
                                                                mailData2.html.push({ name: 'useraddress2', value: maildocdata.user.address.state });
                                                                mailData2.html.push({ name: 'categoryname', value: maildocdata.booking_information.work_type });
                                                                mailData2.html.push({ name: 'hourlyrates', value: currencies.symbol + ' ' + maildocdata.hourly_rate });
                                                                mailData2.html.push({ name: 'totalhour', value: maildocdata.invoice.worked_hours_human });
                                                                mailData2.html.push({ name: 'totalamount', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.grand_total - maildocdata.invoice.amount.service_tax).toFixed(2) });
                                                                mailData2.html.push({ name: 'total', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.total).toFixed(2) });
                                                                mailData2.html.push({ name: 'actualamount', value: currencies.symbol + ' ' + ((maildocdata.invoice.amount.grand_total - maildocdata.invoice.amount.admin_commission) - maildocdata.invoice.amount.service_tax).toFixed(2) });
                                                                mailData2.html.push({ name: 'privacy', value: settings.settings.site_url + 'pages/privacypolicy' });
                                                                mailData2.html.push({ name: 'terms', value: settings.settings.site_url + 'pages/termsandconditions' });
                                                                mailData2.html.push({ name: 'admincommission', value: currencies.symbol + ' ' + maildocdata.invoice.amount.admin_commission.toFixed(2) });
                                                                mailData2.html.push({ name: 'Servicetax', value: currencies.symbol + ' ' + maildocdata.invoice.amount.service_tax.toFixed(2) });
                                                                // mailData2.html.push({ name: 'email', value: req.body.email });
                                                                mailcontent.sendmail(mailData2, function (err, response) { });
                                                                var mailData3 = {};

                                                                mailData3.template = 'PaymentDetailstoUser';
                                                                mailData3.to = maildocdata.user.email;
                                                                mailData3.html = [];
                                                                mailData3.html.push({ name: 'mode', value: maildocdata.payment_type });
                                                                mailData3.html.push({ name: 'datetime', value: DateTime });
                                                                mailData3.html.push({ name: 'bookingdata', value: BookingDate });
                                                                mailData3.html.push({ name: 'coupon', value: CouponCode });
                                                                mailData3.html.push({ name: 'materialfee', value: currencies.symbol + ' ' + MaterialFee });
                                                                mailData3.html.push({ name: 'site_url', value: settings.settings.site_url });
                                                                mailData3.html.push({ name: 'site_title', value: settings.settings.site_title });
                                                                mailData3.html.push({ name: 'logo', value: settings.settings.logo });
                                                                mailData3.html.push({ name: 't_username', value: maildocdata.tasker.name.first_name + "(" + maildocdata.tasker.username + ")" });
                                                                mailData3.html.push({ name: 'taskeraddress', value: maildocdata.tasker.address.line1 });
                                                                mailData3.html.push({ name: 'taskeraddress1', value: maildocdata.tasker.address.city });
                                                                mailData3.html.push({ name: 'taskeraddress2', value: maildocdata.tasker.address.state });
                                                                mailData3.html.push({ name: 'bookingid', value: maildocdata.booking_id });
                                                                mailData3.html.push({ name: 'u_username', value: maildocdata.user.name.first_name + "(" + maildocdata.user.username + ")" });
                                                                mailData3.html.push({ name: 'useraddress', value: maildocdata.user.address.line1 });
                                                                mailData3.html.push({ name: 'useraddress1', value: maildocdata.user.address.city });
                                                                mailData3.html.push({ name: 'useraddress2', value: maildocdata.user.address.state });
                                                                mailData3.html.push({ name: 'categoryname', value: maildocdata.booking_information.work_type });
                                                                mailData3.html.push({ name: 'hourlyrates', value: currencies.symbol + ' ' + maildocdata.hourly_rate });
                                                                mailData3.html.push({ name: 'totalhour', value: maildocdata.invoice.worked_hours_human });
                                                                mailData3.html.push({ name: 'totalamount', value: currencies.symbol + ' ' + maildocdata.invoice.amount.grand_total.toFixed(2) });
                                                                mailData3.html.push({ name: 'total', value: currencies.symbol + ' ' + maildocdata.invoice.amount.total.toFixed(2) });
                                                                mailData3.html.push({ name: 'actualamount', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.total - maildocdata.invoice.amount.grand_total).toFixed(2) });
                                                                mailData3.html.push({ name: 'admincommission', value: currencies.symbol + ' ' + maildocdata.invoice.amount.admin_commission.toFixed(2) });
                                                                mailData3.html.push({ name: 'privacy', value: settings.settings.site_url + 'pages/privacypolicy' });
                                                                mailData3.html.push({ name: 'terms', value: settings.settings.site_url + 'pages/termsandconditions' });
                                                                mailData3.html.push({ name: 'Servicetax', value: currencies.symbol + ' ' + maildocdata.invoice.amount.service_tax.toFixed(2) });
                                                                // mailData3.html.push({ name: 'email', value: req.body.email });
                                                                mailcontent.sendmail(mailData3, function (err, response) { });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });// mail end
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    controller.byWallet = function (req, res) {
        var errors = [];
        req.checkBody('job_id', 'Job ID is Required').notEmpty();
        req.checkBody('user_id', 'User ID is Required').notEmpty();
        errors = req.validationErrors();
        if (errors) {
            res.send({ "status": "0", "errors": errors[0].msg });
            return;
        }
        var data = {};
        data.status = '0';
        var request = {};
        request.user_id = req.body.user_id;
        request.job_id = req.body.job_id;
        db.GetOneDocument('users', { '_id': request.user_id }, {}, {}, function (err, users) {
            if (err || users.length == 0) { data.response = 'Invalid users, Please check your data'; res.send(data); }
            else {
                db.GetOneDocument('currencies', { 'default': 1 }, {}, {}, function (err, currencies) {
                    if (err || !currencies) {
                        res.send({
                            "status": 0,
                            "message": 'Error'
                        });
                    }
                    else {
                        db.GetOneDocument('task', { 'booking_id': request.job_id, 'user': request.user_id, "status": 6 }, {}, {}, function (err, Bookings) {
                            if (err || !Bookings) { data.response = 'Job Invalid'; res.send(data); }
                            else {
                                db.GetOneDocument('walletReacharge', { "user_id": request.user_id }, {}, {}, function (err, wallet) {
                                    if (err || !wallet) { data.response = 'Invalid users, Please check your data'; res.send(data); }
                                    else {
                                        if (wallet.total == 0) {
                                            res.send({ 'status': '0', 'response': 'Sorry insufficient amount please recharge your wallet amount', 'Amount neeeds': Bookings.invoice.amount.total });
                                        } else if (wallet.total < Bookings.invoice.amount.grand_total) {
                                            var provider_id = Bookings.tasker;
                                            var wallet_amount = 0.00;
                                            var job_charge = 0.00;
                                            if (wallet.total) { wallet_amount = parseFloat(wallet.total); }
                                            if (Bookings.invoice.amount.grand_total) { job_charge = parseFloat(Bookings.invoice.amount.grand_total); }
                                            var balanceamount = {};
                                            balanceamount = job_charge - wallet_amount;
                                            var walletArr = {
                                                'type': 'DEBIT',
                                                'debit_type': 'payment',
                                                'ref_id': req.body.job_id,
                                                'trans_amount': parseFloat(wallet.total),
                                                'avail_amount': 0,
                                                'due_amount': job_charge - wallet_amount,
                                                'trans_date': new Date(),
                                                'trans_id': mongoose.Types.ObjectId()
                                            };
                                            db.UpdateDocument('walletReacharge', { 'user_id': req.body.user_id }, { $push: { transactions: walletArr }, $set: { "total": 0 } }, { multi: true }, function (walletUErr, walletURespo) {

                                                if (walletUErr || walletURespo.nModified == 0) {
                                                    data.response = 'Error in data, Please check your data'; res.send(data);
                                                }
                                                else {
                                                    db.UpdateDocument('task', { "booking_id": request.job_id }, { "invoice.amount.balance_amount": balanceamount, "invoice.amount.grand_total": balanceamount, "payment_type": "wallet-other" }, function (err, docdata) {

                                                        if (err || docdata.nModified == 0) { data.response = 'Error data, Please check your data'; res.send(data); }
                                                        else {
                                                            var transaction = {
                                                                'user': request.user_id,
                                                                'tasker': Bookings.tasker,
                                                                'task': Bookings._id,
                                                                'type': 'wallet-other',
                                                                'amount': wallet.total,
                                                                //'amount':  Bookings.invoice.amount.grand_total,
                                                                'task_date': Bookings.createdAt,
                                                                'status': 1
                                                            };

                                                            db.InsertDocument('transaction', transaction, function (err, transaction) {
                                                                if (err || transaction.nModified == 0) { data.response = 'Error in data, Please check your data'; res.send(data); }
                                                                else {
                                                                    var message = CONFIG.NOTIFICATION.PAYMENT_COMPLETED;
                                                                    var options = { 'job_id': request.job_id, 'provider_id': provider_id };

                                                                    // push.sendPushnotification(Bookings.user, message, 'payment_paid', 'ANDROID', options, 'USER', function (err, Response, body) { });
                                                                    // push.sendPushnotification(provider_id, message, 'payment_paid', 'ANDROID', options, 'PROVIDER', function (err, Response, body) { });
                                                                    res.send({
                                                                        'status': '1',
                                                                        'response': 'Transaction partially completed due to insufficient balance in your wallet account,Complete the transaction by recharging the wallet account or by using credit card.!!',
                                                                        'due_amount': ((job_charge - wallet_amount) * currencies.value).toFixed(2),
                                                                        'used_amount': (wallet_amount * currencies.value).toFixed(2),
                                                                        'available_wallet_amount': '0'
                                                                    });
                                                                    //start mail
                                                                    var options = {};
                                                                    options.populate = 'tasker user category';
                                                                    db.GetOneDocument('task', { 'booking_id': req.body.job_id }, {}, options, function (err, maildocdata) {
                                                                        if (err) {
                                                                            res.send(err);
                                                                        } else {
                                                                            db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settings) {
                                                                                if (err) {
                                                                                    res.send(err);
                                                                                } else {
                                                                                    // PARTIALLY PAID mail Content
                                                                                    var notifications = { 'job_id': maildocdata.booking_id, 'user_id': maildocdata.tasker._id };
                                                                                    var message = CONFIG.NOTIFICATION.BILLING_AMOUNT_PARTIALLY_PAID;
                                                                                    push.sendPushnotification(maildocdata.tasker._id, message, 'payment_paid', 'ANDROID', notifications, 'PROVIDER', function (err, response, body) { });
                                                                                    // push.sendPushnotification(maildocdata.user._id, message, 'payment_paid', 'ANDROID', notifications, 'USER', function (err, response, body) { });
                                                                                    // res.send(maildocdata);
                                                                                    db.GetOneDocument('currencies', { 'default': 1 }, {}, {}, function (err, currencies) {
                                                                                        if (err) {
                                                                                            res.send(err);
                                                                                        } else {
                                                                                            var MaterialFee, CouponCode, DateTime, BookingDate;
                                                                                            if (maildocdata.invoice.amount.extra_amount) {
                                                                                                MaterialFee = (maildocdata.invoice.amount.extra_amount).toFixed(2);
                                                                                            } else {
                                                                                                MaterialFee = '0.00';
                                                                                            }
                                                                                            if (maildocdata.invoice.amount.coupon) {
                                                                                                CouponCode = maildocdata.invoice.amount.coupon;
                                                                                            } else {
                                                                                                CouponCode = 'Not assigned';
                                                                                            }
                                                                                            DateTime = moment(maildocdata.history.job_started_time).format('DD/MM/YYYY - HH:mm');
                                                                                            BookingDate = moment(maildocdata.history.booking_date).format('DD/MM/YYYY');
                                                                                            var mailData = {};
                                                                                            mailData.template = 'PartialPaymentToAdmin';
                                                                                            mailData.to = settings.settings.email_address;
                                                                                            mailData.html = [];
                                                                                            mailData.html.push({ name: 'mode', value: maildocdata.payment_type + "(Partial Paid )" });
                                                                                            mailData.html.push({ name: 'materialfee', value: MaterialFee });
                                                                                            mailData.html.push({ name: 'coupon', value: currencies.symbol + ' ' + CouponCode });
                                                                                            mailData.html.push({ name: 'datetime', value: DateTime });
                                                                                            mailData.html.push({ name: 'bookingdata', value: BookingDate });
                                                                                            mailData.html.push({ name: 'site_url', value: settings.settings.site_url });
                                                                                            mailData.html.push({ name: 'site_title', value: settings.settings.site_title });
                                                                                            mailData.html.push({ name: 'logo', value: settings.settings.logo });
                                                                                            mailData.html.push({ name: 't_username', value: maildocdata.tasker.username });
                                                                                            mailData.html.push({ name: 'taskeraddress', value: maildocdata.tasker.address.line1 });
                                                                                            mailData.html.push({ name: 'taskeraddress1', value: maildocdata.tasker.address.city });
                                                                                            mailData.html.push({ name: 'taskeraddress2', value: maildocdata.tasker.address.state });
                                                                                            mailData.html.push({ name: 'bookingid', value: maildocdata.booking_id });
                                                                                            mailData.html.push({ name: 'u_username', value: maildocdata.user.username });
                                                                                            mailData.html.push({ name: 'useraddress', value: maildocdata.user.address.line1 });
                                                                                            mailData.html.push({ name: 'useraddress1', value: maildocdata.user.address.city });
                                                                                            mailData.html.push({ name: 'useraddress2', value: maildocdata.user.address.state });
                                                                                            mailData.html.push({ name: 'categoryname', value: maildocdata.booking_information.work_type });
                                                                                            mailData.html.push({ name: 'hourlyrates', value: currencies.symbol + ' ' + (maildocdata.hourly_rate).toFixed(2) });
                                                                                            mailData.html.push({ name: 'totalhour', value: maildocdata.invoice.worked_hours_human });
                                                                                            mailData.html.push({ name: 'totalamount', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.grand_total).toFixed(2) });
                                                                                            mailData.html.push({ name: 'total', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.total).toFixed(2) });
                                                                                            mailData.html.push({ name: 'amount', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.grand_total - maildocdata.invoice.amount.admin_commission).toFixed(2) });
                                                                                            mailData.html.push({ name: 'actualamount', value: currencies.symbol + ' ' + ((maildocdata.invoice.amount.grand_total - maildocdata.invoice.amount.admin_commission) - MaterialFee).toFixed(2) });
                                                                                            mailData.html.push({ name: 'adminamount', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.admin_commission).toFixed(2) });
                                                                                            mailData.html.push({ name: 'amountpaid', value: currencies.symbol + ' ' + (wallet.total).toFixed(2) });
                                                                                            mailData.html.push({ name: 'balamount', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.balance_amount).toFixed(2) });
                                                                                            mailData.html.push({ name: 'privacy', value: settings.settings.site_url + 'pages/privacypolicy' });
                                                                                            mailData.html.push({ name: 'terms', value: settings.settings.site_url + 'pages/termsandconditions' });
                                                                                            mailData.html.push({ name: 'Servicetax', value: currencies.symbol + ' ' + maildocdata.invoice.amount.service_tax.toFixed(2) });
                                                                                            mailcontent.sendmail(mailData, function (err, response) { });




                                                                                            var mailData2 = {};
                                                                                            mailData2.template = 'PartialPaymentToTasker';
                                                                                            mailData2.to = maildocdata.tasker.email;
                                                                                            mailData2.html = [];
                                                                                            mailData2.html.push({ name: 'mode', value: maildocdata.payment_type + "(Partial Paid )" });
                                                                                            mailData2.html.push({ name: 'coupon', value: CouponCode });
                                                                                            mailData2.html.push({ name: 'bookingdata', value: BookingDate });
                                                                                            mailData2.html.push({ name: 'datetime', value: DateTime });
                                                                                            mailData2.html.push({ name: 'materialfee', value: currencies.symbol + ' ' + MaterialFee });
                                                                                            mailData2.html.push({ name: 'site_url', value: settings.settings.site_url });
                                                                                            mailData2.html.push({ name: 'site_title', value: settings.settings.site_title });
                                                                                            mailData2.html.push({ name: 'logo', value: settings.settings.logo });
                                                                                            mailData2.html.push({ name: 't_username', value: maildocdata.tasker.username });
                                                                                            mailData2.html.push({ name: 'taskeraddress', value: maildocdata.tasker.address.line1 });
                                                                                            mailData2.html.push({ name: 'taskeraddress1', value: maildocdata.tasker.address.city });
                                                                                            mailData2.html.push({ name: 'taskeraddress2', value: maildocdata.tasker.address.state });
                                                                                            mailData2.html.push({ name: 'bookingid', value: maildocdata.booking_id });
                                                                                            mailData2.html.push({ name: 'u_username', value: maildocdata.user.username });
                                                                                            mailData2.html.push({ name: 'useraddress', value: maildocdata.user.address.line1 });
                                                                                            mailData2.html.push({ name: 'useraddress1', value: maildocdata.user.address.city });
                                                                                            mailData2.html.push({ name: 'useraddress2', value: maildocdata.user.address.state });
                                                                                            mailData2.html.push({ name: 'categoryname', value: maildocdata.booking_information.work_type });
                                                                                            mailData2.html.push({ name: 'hourlyrates', value: maildocdata.hourly_rate });
                                                                                            mailData2.html.push({ name: 'totalhour', value: maildocdata.invoice.worked_hours_human });
                                                                                            mailData2.html.push({ name: 'totalamount', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.grand_total).toFixed(2) });
                                                                                            mailData2.html.push({ name: 'total', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.total).toFixed(2) });
                                                                                            mailData2.html.push({ name: 'actualamount', value: currencies.symbol + ' ' + ((maildocdata.invoice.amount.grand_total - maildocdata.invoice.amount.admin_commission) - MaterialFee).toFixed(2) });
                                                                                            mailData2.html.push({ name: 'amountpaid', value: currencies.symbol + ' ' + (wallet.total).toFixed(2) });
                                                                                            mailData2.html.push({ name: 'balamount', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.balance_amount).toFixed(2) });
                                                                                            mailData2.html.push({ name: 'privacy', value: settings.settings.site_url + 'pages/privacypolicy' });
                                                                                            mailData2.html.push({ name: 'terms', value: settings.settings.site_url + 'pages/termsandconditions' });
                                                                                            mailData2.html.push({ name: 'admincommission', value: currencies.symbol + ' ' + maildocdata.invoice.amount.admin_commission.toFixed(2) });
                                                                                            mailData2.html.push({ name: 'Servicetax', value: currencies.symbol + ' ' + maildocdata.invoice.amount.service_tax.toFixed(2) });
                                                                                            mailData2.html.push({ name: 'email', value: req.body.email });
                                                                                            mailcontent.sendmail(mailData2, function (err, response) { });

                                                                                            var mailData3 = {};
                                                                                            mailData3.template = 'PartialPaymentToUser';
                                                                                            mailData3.to = maildocdata.user.email;
                                                                                            mailData3.html = [];
                                                                                            mailData3.html.push({ name: 'mode', value: maildocdata.payment_type + "(Partial Paid )" });
                                                                                            mailData3.html.push({ name: 'datetime', value: DateTime });
                                                                                            mailData3.html.push({ name: 'bookingdata', value: BookingDate });
                                                                                            mailData3.html.push({ name: 'coupon', value: CouponCode });
                                                                                            mailData3.html.push({ name: 'materialfee', value: currencies.symbol + ' ' + MaterialFee });
                                                                                            mailData3.html.push({ name: 'site_url', value: settings.settings.site_url });
                                                                                            mailData3.html.push({ name: 'site_title', value: settings.settings.site_title });
                                                                                            mailData3.html.push({ name: 'logo', value: settings.settings.logo });
                                                                                            mailData3.html.push({ name: 't_username', value: maildocdata.tasker.username });
                                                                                            mailData3.html.push({ name: 'taskeraddress', value: maildocdata.tasker.address.line1 });
                                                                                            mailData3.html.push({ name: 'taskeraddress1', value: maildocdata.tasker.address.city });
                                                                                            mailData3.html.push({ name: 'taskeraddress2', value: maildocdata.tasker.address.state });
                                                                                            mailData3.html.push({ name: 'bookingid', value: maildocdata.booking_id });
                                                                                            mailData3.html.push({ name: 'u_username', value: maildocdata.user.username });
                                                                                            mailData3.html.push({ name: 'useraddress', value: maildocdata.user.address.line1 });
                                                                                            mailData3.html.push({ name: 'useraddress1', value: maildocdata.user.address.city });
                                                                                            mailData3.html.push({ name: 'useraddress2', value: maildocdata.user.address.state });
                                                                                            mailData3.html.push({ name: 'categoryname', value: maildocdata.booking_information.work_type });
                                                                                            mailData3.html.push({ name: 'hourlyrates', value: currencies.symbol + ' ' + maildocdata.hourly_rate });
                                                                                            mailData3.html.push({ name: 'totalhour', value: currencies.symbol + ' ' + maildocdata.invoice.worked_hours_human });
                                                                                            mailData3.html.push({ name: 'totalamount', value: currencies.symbol + ' ' + maildocdata.invoice.amount.grand_total.toFixed(2) });
                                                                                            mailData3.html.push({ name: 'total', value: currencies.symbol + ' ' + maildocdata.invoice.amount.total.toFixed(2) });
                                                                                            mailData3.html.push({ name: 'actualamount', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.total - maildocdata.invoice.amount.grand_total).toFixed(2) });
                                                                                            mailData3.html.push({ name: 'admincommission', value: currencies.symbol + ' ' + maildocdata.invoice.amount.admin_commission.toFixed(2) });
                                                                                            mailData3.html.push({ name: 'amountpaid', value: (wallet.total).toFixed(2) });
                                                                                            mailData3.html.push({ name: 'balamount', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.balance_amount).toFixed(2) });
                                                                                            mailData3.html.push({ name: 'privacy', value: settings.settings.site_url + 'pages/privacypolicy' });
                                                                                            mailData3.html.push({ name: 'terms', value: settings.settings.site_url + 'pages/termsandconditions' });
                                                                                            mailData3.html.push({ name: 'Servicetax', value: currencies.symbol + ' ' + maildocdata.invoice.amount.service_tax.toFixed(2) });
                                                                                            mailData3.html.push({ name: 'email', value: req.body.email });
                                                                                            mailcontent.sendmail(mailData3, function (err, response) { });
                                                                                        }
                                                                                    });
                                                                                }
                                                                            });
                                                                        }
                                                                    });//end mail
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        } else {

                                            var paymenttype = {};
                                            if (Bookings.payment_type == 'wallet-other') {
                                                paymenttype = 'wallet-wallet';
                                            }
                                            else {
                                                paymenttype = 'wallet';
                                            }

                                            var provider_id = Bookings.tasker;
                                            var walletArr = {
                                                'type': 'DEBIT',
                                                'debit_type': 'payment',
                                                'ref_id': req.body.job_id,
                                                'trans_amount': parseFloat(Bookings.invoice.amount.grand_total),
                                                'avail_amount': wallet.total - Bookings.invoice.amount.grand_total,
                                                'trans_date': new Date(),
                                            };
                                            var totalwallet = wallet_amount - job_charge;
                                            db.UpdateDocument('walletReacharge', { 'user_id': request.user_id }, { $push: { transactions: walletArr }, $set: { "total": parseFloat(wallet.total - Bookings.invoice.amount.grand_total) } }, { multi: true }, function (walletUErr, walletURespo) {
                                                if (walletUErr || walletURespo.nModified == 0) {

                                                    data.response = 'Error in data, Please check your data'; res.send(data);
                                                }
                                                else {
                                                    var transaction = {
                                                        'user': request.user_id,
                                                        'tasker': Bookings.tasker,
                                                        'task': Bookings._id,
                                                        'type': paymenttype,
                                                        'amount': Bookings.invoice.amount.grand_total,
                                                        'task_date': Bookings.createdAt,
                                                        'status': 1
                                                    };
                                                    db.InsertDocument('transaction', transaction, function (err, transaction) {
                                                        if (err || transaction.nModified == 0) {
                                                            data.response = 'Error in data, Please check your data'; res.send(data);
                                                        }
                                                        else {
                                                            var transactions = [transaction._id];
                                                            db.UpdateDocument('task', { "booking_id": req.body.job_id }, { $push: { transactions }, 'invoice.status': '1', 'status': '7', 'payment_type': paymenttype, 'history.job_closed_time': new Date() }, function (err, docdata) {
                                                                if (err || docdata.nModified == 0) {
                                                                    data.response = 'Error in data, Please check your data'; res.send(data);
                                                                }
                                                                else {
                                                                    var message = CONFIG.NOTIFICATION.PAYMENT_COMPLETED;
                                                                    var options = { 'job_id': request.job_id, 'provider_id': provider_id };
                                                                    push.sendPushnotification(Bookings.user, message, 'payment_paid', 'ANDROID', options, 'USER', function (err, Response, body) { });
                                                                    push.sendPushnotification(provider_id, message, 'payment_paid', 'ANDROID', options, 'PROVIDER', function (err, Response, body) { });
                                                                    res.send({
                                                                        'status': '1',
                                                                        'message': 'Payment Completed Successfully',
                                                                        'response': 'Wallet amount used successfully',
                                                                        'used_amount': (Bookings.invoice.amount.grand_total * currencies.value).toFixed(2),
                                                                        'available_wallet_amount': ((wallet.total - Bookings.invoice.amount.grand_total) * currencies.value).toFixed(2)
                                                                    });
                                                                    //mail start
                                                                    var options = {};
                                                                    options.populate = 'tasker user category';
                                                                    db.GetOneDocument('task', { 'booking_id': req.body.job_id }, {}, options, function (err, maildocdata) {
                                                                        if (err) {
                                                                            res.send(err);
                                                                        } else {
                                                                            db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settings) {
                                                                                if (err) {
                                                                                    res.send(err);
                                                                                } else {


                                                                                    db.GetOneDocument('currencies', { 'default': 1 }, {}, {}, function (err, currencies) {
                                                                                        if (err) {
                                                                                            res.send(err);
                                                                                        } else {
                                                                                            var MaterialFee, CouponCode, DateTime, BookingDate;
                                                                                            if (maildocdata.invoice.amount.extra_amount) {
                                                                                                MaterialFee = (maildocdata.invoice.amount.extra_amount).toFixed(2);
                                                                                            } else {
                                                                                                MaterialFee = '0.00';
                                                                                            }
                                                                                            if (maildocdata.invoice.amount.coupon) {
                                                                                                CouponCode = maildocdata.invoice.amount.coupon;
                                                                                            } else {
                                                                                                CouponCode = 'Not assigned';
                                                                                            }
                                                                                            DateTime = moment(maildocdata.history.job_started_time).format('DD/MM/YYYY - HH:mm');
                                                                                            BookingDate = moment(maildocdata.history.booking_date).format('DD/MM/YYYY');

                                                                                            var mailData = {};
                                                                                            mailData.template = 'PaymentDetailstoAdmin';
                                                                                            mailData.to = settings.settings.email_address;
                                                                                            mailData.html = [];
                                                                                            mailData.html.push({ name: 'mode', value: maildocdata.payment_type });
                                                                                            mailData.html.push({ name: 'materialfee', value: currencies.symbol + ' ' + MaterialFee });
                                                                                            mailData.html.push({ name: 'coupon', value: CouponCode });
                                                                                            mailData.html.push({ name: 'datetime', value: DateTime });
                                                                                            mailData.html.push({ name: 'bookingdata', value: BookingDate });
                                                                                            mailData.html.push({ name: 'site_url', value: settings.settings.site_url });
                                                                                            mailData.html.push({ name: 'site_title', value: settings.settings.site_title });
                                                                                            mailData.html.push({ name: 'logo', value: settings.settings.logo });
                                                                                            mailData.html.push({ name: 't_username', value: maildocdata.tasker.name.first_name + "(" + maildocdata.tasker.username + ")" });
                                                                                            mailData.html.push({ name: 'taskeraddress', value: maildocdata.tasker.address.line1 });
                                                                                            mailData.html.push({ name: 'taskeraddress1', value: maildocdata.tasker.address.city });
                                                                                            mailData.html.push({ name: 'taskeraddress2', value: maildocdata.tasker.address.state });
                                                                                            mailData.html.push({ name: 'bookingid', value: maildocdata.booking_id });
                                                                                            mailData.html.push({ name: 'u_username', value: maildocdata.user.name.first_name + "(" + maildocdata.user.username + ")" });
                                                                                            mailData.html.push({ name: 'useraddress', value: maildocdata.user.address.line1 });
                                                                                            mailData.html.push({ name: 'useraddress1', value: maildocdata.user.address.city });
                                                                                            mailData.html.push({ name: 'useraddress2', value: maildocdata.user.address.state });
                                                                                            mailData.html.push({ name: 'categoryname', value: maildocdata.booking_information.work_type });
                                                                                            mailData.html.push({ name: 'hourlyrates', value: currencies.symbol + ' ' + (maildocdata.hourly_rate).toFixed(2) });
                                                                                            mailData.html.push({ name: 'totalhour', value: currencies.symbol + ' ' + maildocdata.invoice.worked_hours_human });
                                                                                            mailData.html.push({ name: 'totalamount', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.grand_total).toFixed(2) });
                                                                                            mailData.html.push({ name: 'total', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.total).toFixed(2) });
                                                                                            mailData.html.push({ name: 'amount', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.grand_total - maildocdata.invoice.amount.admin_commission).toFixed(2) });
                                                                                            mailData.html.push({ name: 'actualamount', value: currencies.symbol + ' ' + ((maildocdata.invoice.amount.grand_total - maildocdata.invoice.amount.admin_commission) - MaterialFee).toFixed(2) });
                                                                                            mailData.html.push({ name: 'adminamount', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.admin_commission).toFixed(2) });
                                                                                            mailData.html.push({ name: 'privacy', value: settings.settings.site_url + 'pages/privacypolicy' });
                                                                                            mailData.html.push({ name: 'terms', value: settings.settings.site_url + 'pages/termsandconditions' });
                                                                                            //mailData.html.push({ name: 'senderemail', value: template[0].sender_email });
                                                                                            mailData.html.push({ name: 'Servicetax', value: currencies.symbol + ' ' + maildocdata.invoice.amount.service_tax.toFixed(2) });
                                                                                            //	mailData.html.push({ name: 'email', value: req.body.email });
                                                                                            mailcontent.sendmail(mailData, function (err, response) { });

                                                                                            var mailData2 = {};
                                                                                            mailData2.template = 'PaymentDetailstoTasker';
                                                                                            mailData2.to = maildocdata.tasker.email;
                                                                                            mailData2.html = [];
                                                                                            mailData2.html.push({ name: 'mode', value: maildocdata.payment_type });
                                                                                            mailData2.html.push({ name: 'coupon', value: CouponCode });
                                                                                            mailData2.html.push({ name: 'bookingdata', value: BookingDate });
                                                                                            mailData2.html.push({ name: 'datetime', value: DateTime });
                                                                                            mailData2.html.push({ name: 'materialfee', value: currencies.symbol + ' ' + MaterialFee });
                                                                                            mailData2.html.push({ name: 'site_url', value: settings.settings.site_url });
                                                                                            mailData2.html.push({ name: 'site_title', value: settings.settings.site_title });
                                                                                            mailData2.html.push({ name: 'logo', value: settings.settings.logo });
                                                                                            mailData2.html.push({ name: 't_username', value: maildocdata.tasker.name.first_name + "(" + maildocdata.tasker.username + ")" });
                                                                                            mailData2.html.push({ name: 'taskeraddress', value: maildocdata.tasker.address.line1 });
                                                                                            mailData2.html.push({ name: 'taskeraddress1', value: maildocdata.tasker.address.city });
                                                                                            mailData2.html.push({ name: 'taskeraddress2', value: maildocdata.tasker.address.state });
                                                                                            mailData2.html.push({ name: 'bookingid', value: maildocdata.booking_id });
                                                                                            mailData2.html.push({ name: 'u_username', value: maildocdata.user.name.first_name + "(" + maildocdata.user.username + ")" });
                                                                                            mailData2.html.push({ name: 'useraddress', value: maildocdata.user.address.line1 });
                                                                                            mailData2.html.push({ name: 'useraddress1', value: maildocdata.user.address.city });
                                                                                            mailData2.html.push({ name: 'useraddress2', value: maildocdata.user.address.state });
                                                                                            mailData2.html.push({ name: 'categoryname', value: maildocdata.booking_information.work_type });
                                                                                            mailData2.html.push({ name: 'hourlyrates', value: currencies.symbol + ' ' + maildocdata.hourly_rate });
                                                                                            mailData2.html.push({ name: 'totalhour', value: currencies.symbol + ' ' + maildocdata.invoice.worked_hours_human });
                                                                                            mailData2.html.push({ name: 'totalamount', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.grand_total - maildocdata.invoice.amount.service_tax).toFixed(2) });
                                                                                            mailData2.html.push({ name: 'total', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.total).toFixed(2) });
                                                                                            mailData2.html.push({ name: 'actualamount', value: currencies.symbol + ' ' + ((maildocdata.invoice.amount.grand_total - maildocdata.invoice.amount.admin_commission) - maildocdata.invoice.amount.service_tax).toFixed(2) });
                                                                                            // mailData2.html.push({ name: 'adminamount', value: maildocdata.invoice.amount.admin_commission});
                                                                                            mailData2.html.push({ name: 'privacy', value: settings.settings.site_url + 'pages/privacypolicy' });
                                                                                            mailData2.html.push({ name: 'terms', value: settings.settings.site_url + 'pages/termsandconditions' });
                                                                                            mailData2.html.push({ name: 'admincommission', value: currencies.symbol + ' ' + maildocdata.invoice.amount.admin_commission.toFixed(2) });
                                                                                            //	mailData2.html.push({ name: 'senderemail', value: template[0].sender_email });
                                                                                            mailData2.html.push({ name: 'Servicetax', value: currencies.symbol + ' ' + maildocdata.invoice.amount.service_tax.toFixed(2) });
                                                                                            mailData2.html.push({ name: 'email', value: req.body.email });
                                                                                            mailcontent.sendmail(mailData2, function (err, response) { });
                                                                                            var mailData3 = {};
                                                                                            mailData3.template = 'PaymentDetailstoUser';
                                                                                            mailData3.to = maildocdata.user.email;
                                                                                            mailData3.html = [];
                                                                                            mailData3.html.push({ name: 'mode', value: maildocdata.payment_type });
                                                                                            mailData3.html.push({ name: 'datetime', value: DateTime });
                                                                                            mailData3.html.push({ name: 'bookingdata', value: BookingDate });
                                                                                            mailData3.html.push({ name: 'coupon', value: CouponCode });
                                                                                            mailData3.html.push({ name: 'materialfee', value: currencies.symbol + ' ' + MaterialFee });
                                                                                            mailData3.html.push({ name: 'site_url', value: settings.settings.site_url });
                                                                                            mailData3.html.push({ name: 'site_title', value: settings.settings.site_title });
                                                                                            mailData3.html.push({ name: 'logo', value: settings.settings.logo });
                                                                                            mailData3.html.push({ name: 't_username', value: maildocdata.tasker.name.first_name + "(" + maildocdata.tasker.username + ")" });
                                                                                            mailData3.html.push({ name: 'taskeraddress', value: maildocdata.tasker.address.line1 });
                                                                                            mailData3.html.push({ name: 'taskeraddress1', value: maildocdata.tasker.address.city });
                                                                                            mailData3.html.push({ name: 'taskeraddress2', value: maildocdata.tasker.address.state });
                                                                                            mailData3.html.push({ name: 'bookingid', value: maildocdata.booking_id });
                                                                                            mailData3.html.push({ name: 'u_username', value: maildocdata.user.name.first_name + "(" + maildocdata.user.username + ")" });
                                                                                            mailData3.html.push({ name: 'useraddress', value: maildocdata.user.address.line1 });
                                                                                            mailData3.html.push({ name: 'useraddress1', value: maildocdata.user.address.city });
                                                                                            mailData3.html.push({ name: 'useraddress2', value: maildocdata.user.address.state });
                                                                                            mailData3.html.push({ name: 'categoryname', value: maildocdata.booking_information.work_type });
                                                                                            mailData3.html.push({ name: 'hourlyrates', value: currencies.symbol + ' ' + maildocdata.hourly_rate });
                                                                                            mailData3.html.push({ name: 'totalhour', value: maildocdata.invoice.worked_hours_human });
                                                                                            mailData3.html.push({ name: 'totalamount', value: currencies.symbol + ' ' + maildocdata.invoice.amount.grand_total.toFixed(2) });
                                                                                            mailData3.html.push({ name: 'total', value: currencies.symbol + ' ' + maildocdata.invoice.amount.total.toFixed(2) });
                                                                                            mailData3.html.push({ name: 'actualamount', value: currencies.symbol + ' ' + (maildocdata.invoice.amount.total - maildocdata.invoice.amount.grand_total).toFixed(2) });
                                                                                            mailData3.html.push({ name: 'admincommission', value: currencies.symbol + ' ' + maildocdata.invoice.amount.admin_commission.toFixed(2) });
                                                                                            mailData3.html.push({ name: 'privacy', value: settings.settings.site_url + 'pages/privacypolicy' });
                                                                                            mailData3.html.push({ name: 'terms', value: settings.settings.site_url + 'pages/termsandconditions' });
                                                                                            //mailData3.html.push({ name: 'senderemail', value: template[0].sender_email });
                                                                                            mailData3.html.push({ name: 'Servicetax', value: currencies.symbol + ' ' + maildocdata.invoice.amount.service_tax.toFixed(2) });
                                                                                            mailData3.html.push({ name: 'email', value: req.body.email });
                                                                                            mailcontent.sendmail(mailData3, function (err, response) { });
                                                                                        }
                                                                                    });
                                                                                }
                                                                            });
                                                                        }
                                                                    });// mail end
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    controller.byGateway = function (req, res) {
        var errors = [];
        req.checkBody('job_id', 'Job ID is Required').notEmpty();
        req.checkBody('user_id', 'User ID is Required').notEmpty();
        req.checkBody('gateway', 'Gateway ID is Required').notEmpty();
        errors = req.validationErrors();
        if (errors) {
            res.send({
                "status": "0",
                "errors": errors[0].msg
            });
            return;
        }
        var data = {};
        data.user_id = req.body.user_id;
        data.job_id = req.body.job_id;
        data.payment = req.body.gateway;

        req.sanitizeBody('job_id').trim();
        req.sanitizeBody('user_id').trim();
        req.sanitizeBody('gateway').trim();

        var request = {};
        request.job_id = req.body.job_id;
        request.user_id = req.body.user_id;
        request.gateway = req.body.gateway;

        var extension = {};
        extension.populate = 'tasker';
        db.GetOneDocument('task', { 'booking_id': request.job_id, 'user': request.user_id, 'status': 6 }, {}, extension, function (err, task) {
            if (err || !task) {
                res.send({
                    'status': '0',
                    'response': 'INVALID DATA'
                });
            } else {
                if (task.tasker) {
                    db.GetDocument('paymentgateway', { 'alias': req.body.gateway, 'status': 1 }, {}, {}, function (paymentErr, paymentRespo) {
                        if (paymentErr || !paymentRespo) {
                            res.send({
                                'status': '0',
                                'response': 'INVALID  DATA'
                            });
                        } else {
                            if (task.invoice.amount.grand_total) {
                                if (task.invoice.amount.balance_amount) {
                                    amount_to_receive = (task.invoice.amount.balance_amount).toFixed(2);
                                }
                                else {
                                    amount_to_receive = (task.invoice.amount.grand_total).toFixed(2);
                                }
                                var transaction = {};
                                transaction.user = request.user_id;
                                transaction.tasker = task.tasker._id;
                                transaction.task = task._id;
                                transaction.type = request.gateway;
                                transaction.amount = amount_to_receive;
                                transaction.task_date = task.createdAt;
                                transaction.status = 2
                                db.InsertDocument('transaction', transaction, function (err, transaction) {
                                    if (err || transaction.nModified == 0) { data.response = 'Error in saving your data'; res.send(data); }
                                    else {
                                        res.send({
                                            'status': '1',
                                            'job_id': request.job_id,
                                            'mobile_id': transaction._id,

                                        });
                                    }
                                });
                                //----------------Transcation status 2
                            }
                        }
                    });
                } else {
                    res.send({
                        'status': '0',
                        'response': 'INVALID DATA'
                    });
                }
            }
        });
    }



    controller.applyCoupon = function (req, res) {
        var status = '0';
        var response = '';
        try {
            var data = {};
            data.user_id = req.body.user_id;
            data.code = req.body.code;
            data.reach_date = req.body.pickup_date;
            var errors = [];
            req.checkBody('user_id', 'User ID is Required').notEmpty();
            req.checkBody('code', 'Coupon code is Required').notEmpty();
            req.checkBody('pickup_date', 'Pick Up Date is Required').notEmpty();
            errors = req.validationErrors();
            if (errors) {
                res.send({
                    "status": "0",
                    "response": errors[0].msg
                });
                return;
            }
            if (Object.keys(req.body).length >= 3) {
                db.GetOneDocument('users', { _id: req.body.user_id }, {}, {}, function (err, userRespo) {
                    if (userRespo) {
                        db.GetOneDocument('coupon', { code: req.body.code }, {}, {}, function (promoErr, promoRespo) {
                            if (err || !promoRespo) {
                                res.send({ "status": "0", "response": "Invalid Coupon" });
                            } else {
                                var valid_from = promoRespo.valid_from;
                                var valid_to = promoRespo.expiry_date;
                                var date_time = new Date(req.body.pickup_date);

                                if ((Date.parse(valid_from) <= Date.parse(date_time)) && (Date.parse(valid_to) >= Date.parse(date_time))) {
                                    //if (promoRespo.total_coupons > promoRespo.per_user) {
                                    /*
                                    var coupon_usage = [];
                                    var coupon_count = 0;
                                    if (promoRespo.usage) {
                                        coupon_usage = promoRespo[0].usage;
                                        for (var i = 0; i < promoRespo[0].usage.length; i++) {
                                            if (promoRespo[0].usage[i].user_id && promoRespo[0].usage[i].user_id == req.body.user_id) {
                                                coupon_count++;
                                            }
                                        }
                                    }
                                    if (coupon_count <= promoRespo[0].user_usage) {
                                    */
                                    res.send({
                                        "status": "1",
                                        "response": [{ "message": "Coupon code applied.", "code": req.body.code }]
                                    });
                                    /*
                                    }
                                    } else {
                                        res.send({ "status": "0", "response": "Coupon Expired" });
                                    }
                                    */
                                } else {
                                    res.send({ "status": "0", "response": "Coupon Expired" });
                                }
                            }
                        });
                    } else {
                        res.send({ "status": "0", "response": "Invalid User" });

                    }
                });
            } else {
                res.send({
                    "status": "0",
                    "response": "Some Parameters are missing"
                });
            }
        } catch (e) {

            res.send({
                "status": status,
                "response": "Error in connection"
            });
        }
    };


    return controller;

}
