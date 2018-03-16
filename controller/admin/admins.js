"use strict";
var db = require('../../controller/adaptor/mongodb.js');
var bcrypt = require('bcrypt-nodejs');
var mailcontent = require('../../model/mailcontent.js');
var async = require('async');
var moment = require('moment');
var timezone = require('moment-timezone');

module.exports = function () {
    var router = {};
    router.forgotpassave = function (req, res) {
        var userid = req.body.data.userid
        var data = bcrypt.hashSync(req.body.data.formData, bcrypt.genSaltSync(8), null);
        db.UpdateDocument('admins', { '_id': userid }, { 'password': data }, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    };
    router.getusers = function (req, res) {
        db.GetDocument('admins', {}, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    };
    router.forgotpass = function forgotpass(req, res) {

        var data = {};
        var request = {};
        request.email = req.body.data;
        async.waterfall([
            function (callback) {
                db.GetOneDocument('admins', { 'email': request.email }, {}, {}, function (err, user) {
                    callback(err, user);
                });
            },
            function (user, callback) {
                db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settings) {
                    callback(err, user, settings);
                });
            }
        ], function (err, user, settings) {
            if (err || !user) {
                data.status = '0';
                data.response = 'Errror!';
                res.status(400).send(data);
            } else {
              var name;
              if(user.name){
                name = user.name.first_name +" ("+ user.username +")";
              }else{
                name =  user.username;
              }
                var taskerid = user._id;
                var mailData = {};
                mailData.template = 'Forgotpassword';
                mailData.to = user.email;
                mailData.html = [];
                mailData.html.push({ name: 'name', value: name });
                mailData.html.push({ name: 'email', value: user.email });
                mailData.html.push({ name: 'url', value: settings.settings.site_url + 'admin#/forgotpwdadminmail' + '/' + user._id });
                mailcontent.sendmail(mailData, function (err, response) { });
                data.status = '1';
                data.response = 'Mail Sent Successfully!';
                res.send(data);
            }
        });
    }

    router.currentUser = function (req, res) {
        req.checkBody('currentUserData', 'Invalid currentUserData').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            res.send(errors);
            return;
        }

        db.GetDocument('admins', { username: req.body.currentUserData }, { username: 1, privileges: 1, role: 1 }, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    };

    router.getusersrole = function (req, res) {
        db.GetDocument('admins', { _id: req.body.data, status: { $ne: 0 }, role: "subadmin" }, { password: 0 }, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }
    router.rolemanager = function (req, res) {
        var data = {};
        var privileges = [];
        data.username = req.body.editSubAdminData.username;
        data.name = req.body.editSubAdminData.name;
        data.email = req.body.editSubAdminData.email;
        data.role = 'subadmin';
        data.status = 1;
        data.privileges = req.body.privileges;

        if (req.body.editSubAdminData.confirmPassword) {
            data.password = bcrypt.hashSync(req.body.editSubAdminData.password, bcrypt.genSaltSync(8), null);
        }

        if (req.body.editSubAdminData._id) {
            db.UpdateDocument('admins', { _id: req.body.editSubAdminData._id }, data, {}, function (err, docdata) {

                if (err) {
                    res.send(err);
                } else {
                    res.send(docdata);
                }
            });
        }

        else {
            db.GetDocument('admins', { 'username': data.username }, {}, {}, function (err, getdata) {

                if (getdata.length != 0) {
                    res.status(400).send({ message: 'Username is Already Exist' });
                } else {
                    data.status = 1;
                    db.InsertDocument('admins', data, function (err, result) {
                        if (err) {
                            res.send(err);
                        } else {
                            res.send(result);
                        }
                    });
                }
            });
        }

    }

    router.save = function (req, res) {
        var data = {
            activity: {}
        };
        data.username = req.body.username;
        data.name = req.body.name;
        data.email = req.body.email;
        data.role = 'admin';
        data.status = 1;
        if (req.body.password_confirm) {
            data.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
        }
        if (req.body._id) {
            db.UpdateDocument('admins', { _id: req.body._id }, data, {}, function (err, docdata) {
                if (err) {
                    res.send(err);
                } else {
                    res.send(docdata);
                }
            });
        } else {
            db.GetDocument('admins', { 'username': req.body.username }, {}, {}, function (err, getdata) {

                if (getdata.length != 0) {
                    res.status(400).send({ message: 'Username is Already Exist' });
                } else {
                    //  data.activity.created = new Date();
                    data.status = 1;
                    db.InsertDocument('admins', data, function (err, result) {

                        if (err) {
                            res.send(err);
                        } else {
                            res.send(result);
                        }
                    });
                }
            });
        }

    };
    router.edit = function (req, res) {
        db.GetDocument('admins', { _id: req.body.id }, { password: 0 }, {}, function (err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send(data);
            }
        });
    };
    router.allAdmins = function getusers(req, res) {

        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }
        if (req.body.sort) {
            var sorted = req.body.sort.field;
        }

        async.waterfall([
            function (callback) {
                db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settings) {
                    if (err || !settings) {
                        data.response = 'Configure your website settings'; res.send(data);
                    } else {
                        callback(settings.settings);
                    }
                });
            }], function (settings, callback) {
                var format = "";
                var usersQuery = [
                    { "$match": { status: { $ne: 0 }, "role": "admin" } },
                    {
                        //  "$project": { createdAt: 1, updatedAt: 1, username: 1, role: 1, email: 1, activity: 1, time_zone: { $literal: timezone.tz("$createdAt", "America/Toronto") } }
                        "$project": { createdAt: 1, updatedAt: 1, username: 1, role: 1, email: 1, activity: 1 }
                    },
                    { "$project": { username: 1, document: "$$ROOT" } }, {
                        $group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
                    }
                ];

                var condition = { status: { $ne: 0 } };
                usersQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });

                if (req.body.search) {
                    condition['username'] = { $regex: new RegExp('^' + req.body.search, 'i') };
                    var searchs = req.body.search;
                    usersQuery.push({
                        "$match": {
                            $or: [
                                { "documentData.username": { $regex: searchs + '.*', $options: 'si' } },
                                { "documentData.email": { $regex: searchs + '.*', $options: 'si' } }
                            ]
                        }

                    });
                    //search limit
                    usersQuery.push({$group: { "_id": null, "countvalue": { "$sum": 1 }, "documentData": { $push: "$documentData" } }});
                    usersQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });
                    if (req.body.limit && req.body.skip >= 0) {
                        usersQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
                    }
                    usersQuery.push({ $group: { "_id": null, "count": { "$first": "$countvalue" }, "documentData": { $push: "$documentData" } } });
                     //search limit
                }

                var sorting = {};
                if (req.body.sort) {
                    var sorter = 'documentData.' + req.body.sort.field;
                    sorting[sorter] = req.body.sort.order;
                    usersQuery.push({ $sort: sorting });
                } else {
                    sorting["documentData.createdAt"] = -1;
                    usersQuery.push({ $sort: sorting });
                }

                if ((req.body.limit && req.body.skip >= 0) && !req.body.search) {
                    usersQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
                }
                  if(!req.body.search){
                        usersQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
                  }

                db.GetAggregation('admins', usersQuery, function (err, docdata) {
                    if (err || docdata.length <= 0) {
                        res.send([0, 0]);
                    } else {
                        for (var i = 0; i < docdata[0].documentData.length; i++) {



                            docdata[0].documentData[i].activity.last_login = timezone.tz(docdata[0].documentData[i].activity.last_login, settings.time_zone).format(settings.date_format);
                        }
                        res.send([docdata[0].documentData, docdata[0].count]);
                    }
                });
            });
    }

    router.delete = function (req, res) {
        db.GetDocument('admins', { _id: { $in: req.body.delData } }, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                if (docdata[0].role == 'subadmin') {
                    db.GetDocument('admins', { 'role': 'subadmin', 'status': 1 }, {}, {}, function (err, docdata) {

                        if (err) {
                            res.send(err);
                        } else {
                            if (docdata.length != 1) {

                                db.DeleteDocument('admins', { _id: { $in: req.body.delData } }, function (err, data) {

                                    if (err) {
                                        res.send(err);
                                    } else {
                                        res.send(data);
                                    }
                                });
                            } else {
                                res.status(400).send({ message: 'Atleast one subadmin need' });
                            }
                        }
                    });
                } else {
                    db.GetDocument('admins', { 'role': 'admin', 'status': 1 }, {}, {}, function (err, docdata) {
                        if (err) {
                            res.send(err);
                        } else {
                            if (docdata.length != 1) {
                                //  db.UpdateDocument('admins', { _id: { $in: req.body.delData } }, { 'status': 0 }, { multi: true }, function (err, data) {
                                db.DeleteDocument('admins', { _id: { $in: req.body.delData } }, function (err, data) {

                                    if (err) {
                                        res.send(err);
                                    } else {
                                        res.send(data);
                                    }
                                });
                            } else {
                                res.status(400).send({ message: 'Atleast one admin need to maintain the site' });
                            }
                        }
                    });
                }
            }
        });
    };

    router.allSubAdmins = function getusers(req, res) {
        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }

        if (req.body.sort) {
            var sorted = req.body.sort.field;
        }


        var usersQuery = [{
            "$match": { status: { $ne: 0 }, "role": "subadmin" }
        }, {
            $project: {
                createdAt: 1,
                updatedAt: 1,
                username: 1,
                role: 1,
                email: 1,
                dname: { $toLower: '$' + sorted },
                activity: 1
            }
        }, {
            $project: {
                username: 1,
                document: "$$ROOT"
            }
        }, {
            $group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
        }];


        var condition = { status: { $ne: 0 } };
        usersQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });

        if (req.body.search) {
            condition['username'] = { $regex: new RegExp('^' + req.body.search, 'i') };
            var searchs = req.body.search;
            usersQuery.push({
                "$match": {
                    $or: [
                        { "documentData.username": { $regex: searchs + '.*', $options: 'si' } },
                        { "documentData.email": { $regex: searchs + '.*', $options: 'si' } }
                    ]
                }
            });

              //search limit
             usersQuery.push({$group: { "_id": null, "countvalue": { "$sum": 1 }, "documentData": { $push: "$documentData" } }});
             usersQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });
              if (req.body.limit && req.body.skip >= 0) {
                usersQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
              }
             usersQuery.push({ $group: { "_id": null, "count": { "$first": "$countvalue" }, "documentData": { $push: "$documentData" } } });
              //search limit

        }

        var sorting = {};
        if (req.body.sort) {
            var sorter = 'documentData.' + req.body.sort.field;
            sorting[sorter] = req.body.sort.order;
            usersQuery.push({ $sort: sorting });
        } else {
            sorting["documentData.createdAt"] = -1;
            usersQuery.push({ $sort: sorting });
        }

        if ((req.body.limit && req.body.skip >= 0) && !req.body.search) {
            usersQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
        }
          if(!req.body.search){
            usersQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
        }
        //usersQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });

        db.GetAggregation('admins', usersQuery, function (err, docdata) {
            if (err || docdata.length <= 0) {
                res.send([0, 0]);
            } else {
                res.send([docdata[0].documentData, docdata[0].count]);
            }
        });
    };


 router.earningsDetails = function (req, res) {
        var data = {};
        db.GetOneDocument('currencies', { 'default': 1 }, {}, {}, function (err, currencies) {
            if (err || !currencies) {
                res.send({
                    "status": 0,
                    "message": 'Invalid Provider, Please check your data'
                });
            } else {
                var CurrentDate = new Date();
                var StatsDate = CurrentDate.setMonth(CurrentDate.getMonth() - 6);
                var pipeline = [
                    { $match: { 'status': 7, 'booking_information.booking_date': { $gt: CurrentDate, $lt: new Date() } } },
                    { $project: { 'status': 1, 'booking_information': 1, 'invoice': 1, 'month': { $month: "$booking_information.booking_date" }, 'year': { $year: "$booking_information.booking_date" } } },
                    { $group: { '_id': { year: '$year', month: '$month' }, 'status': { $first: '$status' }, 'month': { $first: '$month' }, 'year': { $first: '$year' }, 'amount': { $sum: '$invoice.amount.grand_total' }, 'adminEarnings': { $sum: '$invoice.amount.admin_commission' } } },
                    { $group: { '_id': '$status', 'status': { $first: '$status' }, 'earnings': { $push: { 'month': '$month', 'year': '$year', 'amount': { $sum: '$amount' }, 'admin_earnings': { $sum: '$adminEarnings' } } }, 'total_earnings': { $sum: '$amount' } } }
                ];
                db.GetAggregation('task', pipeline, function (err, bookings) {
                    if (err) {
                        data.response = 'Unable to get your stats, Please check your data';
                        res.send(data);
                    } else {
                        data.status = '1';
                        data.response = {};
                        var earning = [];
                        var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        var monthNamesval = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

                        if (bookings.length == 0) {
                            for (var i = 0; i < 6; i++) {
                                var amount = 0;
                                var admin_earnings = 0;
                                var CurrentDate = new Date();
                                var StatsDate = CurrentDate.setMonth(CurrentDate.getMonth() - i);
                                var StatsMonth = CurrentDate.getMonth() + 1;
                                var StatsYear = CurrentDate.getFullYear();
                                earning.push({ 'month': monthNames[StatsMonth - 1], 'monthval': monthNamesval[StatsMonth - 1], 'amount': 0, 'admin_earnings': 0 });
                            }
                            data.response.unit = '';
                            data.response.total_earnings = 0;
                            data.response.interval = 0;
                            data.response.earnings = earning;
                            data.response.max_earnings = 0;
                            data.response.currency_code = currencies.code;
                            res.send(data);
                        }
                        else {
                            for (var i = 0; i < 6; i++) {
                                var amount = 0;
                                var admin_earnings = 0;
                                var CurrentDate = new Date();
                                var StatsDate = CurrentDate.setMonth(CurrentDate.getMonth() - i);
                                var StatsMonth = CurrentDate.getMonth() + 1;
                                var StatsYear = CurrentDate.getFullYear();
                                if (bookings[0]) {
                                    for (var j = 0; j < bookings[0].earnings.length; j++) {
                                        if (StatsMonth == bookings[0].earnings[j].month && StatsYear == bookings[0].earnings[j].year) {
                                            amount = bookings[0].earnings[j].amount;
                                            admin_earnings = bookings[0].earnings[j].admin_earnings;
                                        }
                                    }
                                }
                                if (amount != 0) {
                                    earning.push({ 'month': monthNames[StatsMonth - 1], 'monthval': monthNamesval[StatsMonth - 1], 'amount': (amount * currencies.value).toFixed(2), 'admin_earnings': (admin_earnings * currencies.value).toFixed(2) });
                                } else {
                                    earning.push({ 'month': monthNames[StatsMonth - 1], 'monthval': monthNamesval[StatsMonth - 1], 'amount': 0, 'admin_earnings': 0 });
                                }
                            }
                            data.status = '1';
                            data.response = {};
                            if (bookings[0]) {
                                if (bookings[0].total_earnings > 0) { data.response.unit = '(In Thousands)'; } else { data.response.unit = '' }
                                data.response.total_earnings = Math.round(bookings[0].total_earnings);
                                data.response.interval = 1;
                            } else {
                                data.response.unit = '';
                                data.response.total_earnings = 0;
                                data.response.interval = 0;
                            }
                            //  data.response.admin_earnings = bookings[0].admin_earnings;
                            data.response.earnings = earning;
                            data.response.max_earnings = Math.round(Math.max.apply(Math, earning.map(function (o) { return o.amount; })));
                            if (data.response.max_earnings > 0) { data.response.interval = Math.round(data.response.max_earnings / 10); }
                            data.response.currency_code = currencies.code;
                            res.send(data);
                        }
                    }
                })
            }
        })
    };

   /* router.earningsDetails = function (req, res) {
        var data = {};
        db.GetOneDocument('currencies', { 'default': 1 }, {}, {}, function (err, currencies) {
            if (err || !currencies) {
                res.send({
                    "status": 0,
                    "message": 'Invalid Provider, Please check your data'
                });
            } else {
                var CurrentDate = new Date();
                var StatsDate = CurrentDate.setMonth(CurrentDate.getMonth() - 6);
                var pipeline = [
                    { $match: { 'status': 7, 'booking_information.booking_date': { $gt: CurrentDate, $lt: new Date() } } },
                    { $project: { 'status': 1, 'booking_information': 1, 'invoice': 1, 'month': { $month: "$booking_information.booking_date" }, 'year': { $year: "$booking_information.booking_date" } } },
                    { $group: { '_id': { year: '$year', month: '$month' }, 'status': { $first: '$status' }, 'month': { $first: '$month' }, 'year': { $first: '$year' }, 'amount': { $sum: '$invoice.amount.grand_total' }, 'adminEarnings': { $sum: '$invoice.amount.admin_commission' } } },
                    { $group: { '_id': '$status', 'status': { $first: '$status' }, 'earnings': { $push: { 'month': '$month', 'year': '$year', 'amount': { $sum: '$amount' }, 'admin_earnings': { $sum: '$adminEarnings' } } }, 'total_earnings': { $sum: '$amount' } } }
                ];
                db.GetAggregation('task', pipeline, function (err, bookings) {
                    if (err) {
                        data.response = 'Unable to get your stats, Please check your data';
                        res.send(data);
                    } else {
                        var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        var monthNamesval = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
                        var earning = [];
                        for (var i = 0; i < 6; i++) {
                            var amount = 0;
                            var admin_earnings = 0;
                            var CurrentDate = new Date();
                            var StatsDate = CurrentDate.setMonth(CurrentDate.getMonth() - i);
                            var StatsMonth = CurrentDate.getMonth() + 1;
                            var StatsYear = CurrentDate.getFullYear();
                            if (bookings[0]) {
                                for (var j = 0; j < bookings[0].earnings.length; j++) {
                                    if (StatsMonth == bookings[0].earnings[j].month && StatsYear == bookings[0].earnings[j].year) {
                                        amount = bookings[0].earnings[j].amount;
                                        admin_earnings = bookings[0].earnings[j].admin_earnings;
                                    }
                                }
                            }
                            if (amount != 0) {
                                earning.push({ 'month': monthNames[StatsMonth - 1], 'monthval': monthNamesval[StatsMonth - 1], 'amount': (amount * currencies.value).toFixed(2), 'admin_earnings': (admin_earnings * currencies.value).toFixed(2) });
                            } else {
                                earning.push({ 'month': monthNames[StatsMonth - 1], 'monthval': monthNamesval[StatsMonth - 1], 'amount': 0, 'admin_earnings': 0 });
                            }
                        }
                        data.status = '1';
                        data.response = {};
                        if (bookings[0]) {
                            if (bookings[0].total_earnings > 0) { data.response.unit = '(In Thousands)'; } else { data.response.unit = '' }
                            data.response.total_earnings = Math.round(bookings[0].total_earnings);
                            data.response.interval = 1;
                        } else {
                            data.response.unit = '';
                            data.response.total_earnings = 0;
                            data.response.interval = 0;
                        }
                        //  data.response.admin_earnings = bookings[0].admin_earnings;
                        data.response.earnings = earning;
                        data.response.max_earnings = Math.round(Math.max.apply(Math, earning.map(function (o) { return o.amount; })));
                        if (data.response.max_earnings > 0) { data.response.interval = Math.round(data.response.max_earnings / 10); }
                        data.response.currency_code = currencies.code;
                        res.send(data);
                    }
                })
            }
        })
    };*/

    return router;
};
