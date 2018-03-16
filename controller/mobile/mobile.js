"use strict";
module.exports = function (io) {

    var moment = require("moment");
    var db = require('../adaptor/mongodb.js');
    var multer = require('multer');
    var CONFIG = require('../../config/config');
    var mongoose = require('mongoose');
    var async = require("async");
    var library = require('../../model/library.js');
    var stripe = require('stripe')('sk_test_1aQzKO9htQAEqlFPvigo717t');
    var push = require('../../model/pushNotification.js')(io);
    var timezone = require('moment-timezone');

    var controller = {};
    controller.proceedPayment = function (req, res) {
        var data = {};
        var errors = [];
        req.checkQuery('mobileId', 'Mobile Id is Required').notEmpty();
        errors = req.validationErrors();
        if (errors) {
            res.send({
                "status": "0",
                "errors": errors[0].msg
            });
            return;
        }
        data.mobile_id = req.query.mobileId;

        db.GetOneDocument('transaction', { '_id': data.mobile_id, 'status': 2 }, {}, {}, function (err, docdata) {
            if (err || !docdata) { data.response = 'Error in fectching data'; res.send(data); }
            else {
                var payment_type = req.query.transaction_type;
                switch (docdata.type) {
                    case 'creditcard':
                        res.redirect("http://" + req.headers.host + '/mobile/mobile/payment-form?mobileId=' + data.mobile_id);
                        break;
                    case 'paypal':
                        res.redirect("http://" + req.headers.host + '/mobile/mobile/payment-paypal?mobileId=' + data.mobile_id);
                        break;
                    case 'stripe':
                        res.redirect("http://" + req.headers.host + '/mobile/mobile/stripe-manual-payment-form?mobileId=' + data.mobile_id);
                        break;
                    default:
                        res.redirect("http://" + req.headers.host + '/mobile/mobile/failed');
                }
            }
        });
    };
    controller.remitaPaymentForm = function (req, res) {
        var request = {};
        var errors = [];
        var data = {};
        errors = req.validationErrors();
        if (errors) {
            res.send({
                "status": "0",
                "errors": errors[0].msg
            });
            return;
        }
        db.GetOneDocument('settings', { "alias": "general" }, { 'settings': 1 }, {}, function (err, settings) {
            if (err || !settings) {
                res.send({
                    'status': '0',
                    'response': 'INVALID DATA'
                });
            } else {
                request.mobileId = req.query.mobileId;
                db.GetOneDocument('paymentgateway', { 'gateway_name': 'Remita' }, {}, {}, function (err, paymentGateway) {
                    if (err || !paymentGateway) {
                        res.render('error', { base_url: settings.settings.site_url, title: '' })
                    } else {
                        db.GetOneDocument('currencies', { 'default': 1 }, {}, {}, function (err, currencies) {
                            if (err || !currencies) {
                                res.send({
                                    "status": 0,
                                    'response': 'INVALID DATA'
                                });
                            }
                            else {
                                db.GetOneDocument('transaction', { '_id': request.mobileId, 'status': { '$in': [1, 2] } }, {}, {}, function (err, transaction) {
                                    if (err || !transaction) { res.redirect("http://" + req.headers.host + '/mobile/mobile/failed'); }
                                    else {
                                        var pug = {};
                                        pug.transaction = transaction;
                                        pug.currencies = currencies.symbol;
                                        pug.site_url = settings.settings.site_url;
                                        res.render('mobile/remita_payment_card', pug);
                                    }
                                });
                            }
                        });

                    }
                });
            }
        });
    }

    controller.failed = function (req, res) {
        res.render('failed', { title: 'Hey', message: '../app/mobile/images/failed.png' });
    };

    controller.userPaymentCard = function (req, res) {
        var errors = [];
        req.checkBody('task_id', 'Job ID is Required').notEmpty();
        req.checkBody('user_id', 'User ID is Required').notEmpty();
        req.checkBody('total_amount', 'Total Amount is Required').notEmpty();
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
        data.task_id = req.body.task_id;
        data.amount = req.body.total_amount;
        db.GetDocument('task', { '_id': new mongoose.Types.ObjectId(req.body.task_id), "user": req.body.user_id }, {}, {}, function (bookErr, bookRespo) {
            if (bookErr) {
                res.render('mobile/payment_return', { title: '' });
            }
            if (bookRespo.length > 0) {
                db.UpdateDocument('task', { task_id: req.body.task_id }, { $set: { 'pay_status': 3 } }, { multi: true }, function (bookUErr, bookURespo) {
                    var tips_amt = 0.00;
                    if (bookRespo[0].total) {
                        if (bookRespo[0].totaltips_amount > 0) {
                            tips_amt = bookRespo[0].total.tips_amount;
                        }
                    }
                    var amount = req.body.total_amount + tips_amt;
                    /* var Auth_Details = $this->data['authorize_net_settings'];
                     var Auth_Setting_Details = $Auth_Details['settings'];*/
                    /*define("AUTHORIZENET_API_LOGIN_ID", $Auth_Setting_Details['Login_ID']);    // Add your API LOGIN ID
                    define("AUTHORIZENET_TRANSACTION_KEY", $Auth_Setting_Details['Transaction_Key']); // Add your API transaction key
                    define("API_MODE", $Auth_Setting_Details['mode']);*/
                });
            } else {
                res.render('mobile/payment_return', { title: '' });
            }
        });
    }

    controller.manualPaymentForm = function (req, res) {
        var request = {};
        var errors = [];
        var data = {};
        errors = req.validationErrors();
        if (errors) {
            res.send({
                "status": "0",
                "errors": errors[0].msg
            });
            return;
        }
        db.GetOneDocument('settings', { "alias": "general" }, { 'settings': 1 }, {}, function (err, settings) {
            if (err || !settings) {
                res.send({
                    'status': '0',
                    'response': 'INVALID DATA'
                });
            } else {
                request.mobileId = req.query.mobileId;
                db.GetOneDocument('paymentgateway', { 'gateway_name': 'Stripe' }, {}, {}, function (err, paymentGateway) {
                    if (err || !paymentGateway) {
                        res.render('error', { base_url: settings.settings.site_url, title: '' })
                    } else {
                        db.GetOneDocument('transaction', { '_id': request.mobileId, 'status': 2 }, {}, {}, function (err, transaction) {
                            if (err || !transaction) { res.redirect("http://" + req.headers.host + '/mobile/mobile/failed'); }
                            else {

                                db.GetOneDocument('currencies', { 'default': 1 }, {}, {}, function (err, currencies) {
                                    if (err || !currencies) {
                                        res.send({
                                            "status": "0",
                                            "response": 'Data Not available'
                                        });
                                    }
                                    else {
                                        var pug = {};
                                        pug.transaction = transaction;
                                        pug.symbol = currencies.symbol;
                                        pug.site_url = settings.settings.site_url;
                                        res.render('mobile/stripe_payment_card', pug);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    controller.paymentMsg = function (req, res) {
        var errors = [];
        req.assert('msg', 'msg is Required').notEmpty();
        errors = req.validationErrors();
        if (errors) {
            res.send({
                "status": "0",
                "errors": errors[0].msg
            });
            return;
        }
        var msg = req.params.msg;
        res.render('mobile/payment_return', { title: '', message: msg });
    }

    controller.mfailed = function (req, res) {
        db.GetOneDocument('settings', { "alias": "general" }, { 'settings': 1 }, {}, function (err, settings) {
            res.render('mobile/payment-failed', { image: settings.settings.site_url + 'app/mobile/images/failed.png' });
        });
    };

    controller.registrFailed = function (req, res) {
        db.GetOneDocument('settings', { "alias": "general" }, { 'settings': 1 }, {}, function (err, settings) {
            res.render('mobile/registration-failed', { image: settings.settings.site_url + 'app/mobile/images/failed.png' });
        });
    };
    controller.finalregistrFailed = function (req, res) {
        db.GetOneDocument('settings', { "alias": "general" }, { 'settings': 1 }, {}, function (err, settings) {
            res.render('mobile/registration-finalfailed', { image: settings.settings.site_url + 'app/mobile/images/failed.png' });
        });
    };
    controller.samemobile = function (req, res) {
        db.GetOneDocument('settings', { "alias": "general" }, { 'settings': 1 }, {}, function (err, settings) {
            res.render('mobile/rating', { image: settings.settings.site_url + 'app/mobile/images/failed.png' });
        });
    };
    controller.latlongFailed = function (req, res) {
        db.GetOneDocument('settings', { "alias": "general" }, { 'settings': 1 }, {}, function (err, settings) {
            res.render('mobile/registration-latlonfailed', { image: settings.settings.site_url + 'app/mobile/images/failed.png' });
        });
    };
    controller.registerTimeout = function (req, res) {
        db.GetOneDocument('settings', { "alias": "general" }, { 'settings': 1 }, {}, function (err, settings) {
            res.render('mobile/registration-timeout', { image: settings.settings.site_url + 'app/mobile/images/failed.png' });
        });
    };

    controller.msucess = function (req, res) {

        db.GetOneDocument('settings', { "alias": "general" }, { 'settings': 1 }, {}, function (err, settings) {
            var payment = {};
            //payment.user = request.user_id;
            //payment.transaction = request.transaction_id;
            //payment.charge = charges.id;
            payment.image = settings.settings.site_url + 'app/mobile/images/success.png';
            res.render('mobile/payment-success', payment);

        });
    };

    controller.paypalsucess = function (req, res) {

        db.GetOneDocument('settings', { "alias": "general" }, { 'settings': 1 }, {}, function (err, settings) {
            var payment = {};
            //payment.user = request.user_id;
            //payment.transaction = request.transaction_id;
            //payment.charge = charges.id;
            payment.image = settings.settings.site_url + 'app/mobile/images/success.png';
            res.render('mobile/payment-successpaypal', payment);

        });
    };

    controller.paymentfailed = function (req, res) {
        db.GetOneDocument('settings', { "alias": "general" }, { 'settings': 1 }, {}, function (err, settings) {
            res.render('mobile/payment-failed', { image: settings.settings.site_url + 'app/mobile/images/failed.png' });
        });
    };

    controller.paymentsuccess = function (req, res) {
        db.GetOneDocument('settings', { "alias": "general" }, { 'settings': 1 }, {}, function (err, settings) {
            var payment = {};
            //payment.user = request.user_id;
            //payment.transaction = request.transaction_id;
            //payment.charge = charges.id;
            payment.image = settings.settings.site_url + 'app/mobile/images/success.png';
            res.render('mobile/payment-success', payment);

        });
    };

    controller.cardpaymentsuccess = function (req, res) {
        db.GetOneDocument('settings', { "alias": "general" }, { 'settings': 1 }, {}, function (err, settings) {
            var payment = {};
            //payment.user = request.user_id;
            //payment.transaction = request.transaction_id;
            //payment.charge = charges.id;
            payment.image = settings.settings.site_url + 'app/mobile/images/success.png';
            res.render('mobile/payment-successbycard', payment);

        });
    };


     controller.chathistory = function (req, res) {

        var data = {};
        data.status = '0';
        req.checkBody('user', 'Invalid user id').notEmpty();
        req.checkBody('tasker', 'Invalid tasker id').notEmpty();
        req.checkBody('task', 'Invalid task id').notEmpty();
        req.checkBody('read_status', 'Invalid read_status').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
          data.response = errors[0].msg; res.send(data); return;
        }

        req.sanitizeBody('user').trim();
        req.sanitizeBody('tasker').trim();
        req.sanitizeBody('task').trim();

        var request = {};
        request.user = req.body.user;
        request.tasker = req.body.tasker;
        request.task = req.body.task;
        request.read_status = req.body.read_status;
        var message = [];
        //  message.messages = [];
        async.parallel({
            user: function (callback) {
                db.GetOneDocument('users', { '_id': request.user }, { 'username': 1, 'avatar': 1, email: 1, phone: 1 }, {}, function (err, response) {
                    callback(err, response);
                });
            },
            tasker: function (callback) {
                db.GetOneDocument('tasker', { '_id': request.tasker }, { 'username': 1, 'avatar': 1, email: 1, phone: 1 }, {}, function (err, response) {
                    callback(err, response);
                });
            },
            task: function (callback) {
                db.GetOneDocument('task', { '_id': request.task }, {}, {}, function (err, response) {
                    callback(err, response);
                });
            },
            settings: function (callback) {
                db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, response) {
                    callback(err, response);
                });
            }
        }, function (err, result) {
            if (err) {
                data.response = "You're not a valid user";
                res.send(data);
            } else {
                if (request.read_status == 'user') {
                    db.UpdateDocument('messages', { 'user': request.user, 'task': request.task, 'tasker': request.tasker }, { "user_status": 2 }, { multi: true }, function (err, response) { });
                }
                else {
                    db.UpdateDocument('messages', { 'user': request.user, 'task': request.task, 'tasker': request.tasker }, { "tasker_status": 2 }, { multi: true }, function (err, response) { });
                }
                var condition = [
                    { $match: { 'status': 1, $or: [{ 'user': mongoose.Types.ObjectId(request.user), 'tasker': mongoose.Types.ObjectId(request.tasker) }, { 'user': mongoose.Types.ObjectId(request.tasker), 'tasker': mongoose.Types.ObjectId(request.user) }], 'task': mongoose.Types.ObjectId(request.task), } },
                    { $lookup: { 'from': 'users', 'localField': 'user', 'foreignField': '_id', 'as': 'user' } },
                    { $lookup: { 'from': 'tasker', 'localField': 'tasker', 'foreignField': '_id', 'as': 'tasker' } },
                    { $unwind: "$user" },
                    { $unwind: "$tasker" },
                    {
                        $group: {
                            _id: "$task", user: { $first: "$user" }, tasker: { $first: "$tasker" }, task: { $first: "$task" }, messages: {
                                $push: {
                                    _id: "$_id",
                                    from: "$from",
                                    message: "$message",
                                    date: "$createdAt",
                                    status: "$status",
                                    user_status: "$user_status",
                                    tasker_status: "$tasker_status"
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            'user._id': 1, 'user.avatar': 1, 'user.username': 1, 'user.email': 1,
                            'tasker._id': 1, 'tasker.avatar': 1, 'tasker.username': 1, 'tasker.email': 1,
                            'messages': 1, '_id': 0, date: "$createdAt"
                        }
                    }
                ];
                db.GetAggregation('messages', condition, function (err, messages) {
                    if (err || !messages[0]) {
                        var message = {};
                        message.user = {};
                        message.tasker = {};
                        if (result.user) {
                            if (result.user.avatar) {
                                message.user.avatar = result.settings.settings.site_url + result.user.avatar;
                            } else {
                                message.user.avatar = result.settings.settings.site_url + CONFIG.USER_PROFILE_IMAGE_DEFAULT;
                            }
                        }
                        if (result.user.phone.code && result.user.phone.number) {
                            message.user.phone_number = result.user.phone.code + result.user.phone.number;
                        }
                        else {
                            message.user.phone_number = "";
                        }
                        message.user._id = result.user._id || "";
                        message.user.username = result.user.username || "";
                        message.user.email = result.user.email || "";

                        if (result.tasker) {
                            if (result.tasker.avatar) {
                                message.tasker.avatar = result.settings.settings.site_url + result.tasker.avatar;
                            } else {
                                message.tasker.avatar = result.settings.settings.site_url + CONFIG.USER_PROFILE_IMAGE_DEFAULT;
                            }
                        }
                        if (result.tasker.phone.code && result.tasker.phone.number) {
                            message.tasker.phone_number = result.tasker.phone.code + result.tasker.phone.number;
                        }
                        else {
                            message.tasker.phone_number = "";
                        }
                        message.tasker._id = result.tasker._id || "";
                        message.tasker.username = result.tasker.username || "";
                        message.tasker.email = result.tasker.email || "";
                        message.messages = [];
                        message.status = '1';
                        res.send(message);
                    } else {
                        for (var i = 0; i < messages[0].messages.length; i++) {
                            messages[0].messages[i].date = timezone.tz(messages[0].messages[i].date, result.settings.settings.time_zone).format(result.settings.settings.date_format) + ', ' +
                                timezone.tz(messages[0].messages[i].date, result.settings.settings.time_zone).format(result.settings.settings.time_format);
                        }

                        if (messages[0].user.avatar) {
                            messages[0].user.avatar = result.settings.settings.site_url + messages[0].user.avatar;
                        } else {
                            messages[0].user.avatar = result.settings.settings.site_url + CONFIG.USER_PROFILE_IMAGE_DEFAULT;
                        }
                        if (result.user.phone.code && result.user.phone.number) {
                            messages[0].user.phone_number = result.user.phone.code + result.user.phone.number;
                        }
                        else {
                            messages[0].user.phone_number = "";
                        }
                        if (messages[0].tasker.avatar) {
                            messages[0].tasker.avatar = result.settings.settings.site_url + messages[0].tasker.avatar;
                        } else {
                            messages[0].tasker.avatar = result.settings.settings.site_url + CONFIG.USER_PROFILE_IMAGE_DEFAULT;
                        }
                        if (result.tasker.phone.code && result.tasker.phone.number) {
                            messages[0].tasker.phone_number = result.tasker.phone.code + result.tasker.phone.number;
                        }
                        else {
                            messages[0].tasker.phone_number = "";
                        }
                        messages[0].status = '1';
                        res.send(messages[0]);
                    }

                });
            }
        });
    }


    controller.unreadmsg = function (req, res) {

        var data = {};
        data.status = '0';

        req.checkBody('user', 'Invalid user id').notEmpty();
        req.checkBody('type', 'Invalid user id').notEmpty();


        var errors = req.validationErrors();
        if (errors) { data.response = errors[0].msg; res.send(data); return; }

        req.sanitizeBody('user').trim();
        req.sanitizeBody('type').trim();

        var user = req.body.user;
        var type = req.body.type;

        var matchcase = {};
        if (type == 'user') {
            matchcase = { 'status': 1, 'user_status': 1, 'user': mongoose.Types.ObjectId(user) };
        } else if (type == 'tasker') {
            matchcase = { 'status': 1, 'tasker_status': 1, 'tasker': mongoose.Types.ObjectId(user) };
        }
        var condition = [
            { $match: matchcase },
            { $lookup: { 'from': 'users', 'localField': 'user', 'foreignField': '_id', 'as': 'user' } },
            { $lookup: { 'from': 'tasker', 'localField': 'tasker', 'foreignField': '_id', 'as': 'tasker' } },
            { $group: { '_id': { 'task': '$task' }, 'messages': { '$first': '$message' }, 'user': { '$first': '$user' }, 'tasker': { '$first': '$tasker' }, 'count': { $sum: 1 } } },
            {
                $project: {
                    '_id': 0, 'count': 1
                }
            },
            { $lookup: { 'from': 'task', 'localField': 'task', 'foreignField': '_id', 'as': 'task' } },
            { $unwind: { path: '$task', preserveNullAndEmptyArrays: true } }
        ];
        db.GetAggregation('messages', condition, function (err, messages) {
            if (err) {
                data.response = "There is no unread messages available";
                res.send(data);
            } else {
                data.status = '1';
                data.messages;
                res.send(data);
            }
        });
    }

    return controller;
}
