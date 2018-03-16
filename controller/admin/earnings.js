var db = require('../../controller/adaptor/mongodb.js');
var async = require('async');
var mongoose = require('mongoose');
var cron = require('node-cron');
var timezone = require('moment-timezone');

module.exports = function () {

    var router = {};

    router.list = function list(req, res) {

        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }

        async.parallel({
            PeriodicCycle: function (callback) {
                if (req.body.data) {
                    db.GetOneDocument('billing', { _id: req.body.data }, {}, {}, function (err, billing) {
                        callback(err, billing);
                    });
                } else {
                    callback(null, null);
                }
            },
            OnGoingCycle: function (callback) {
                var ext = {};
                ext.sort = { 'createdAt': -1 }
                db.GetOneDocument('billing', {}, {}, ext, function (err, billing) {
                    callback(err, billing);
                });
            }
        }, function (err, results) {

            var match = {};
            if (results.PeriodicCycle) {
                var startdate = results.PeriodicCycle.start_date;
                var enddate = results.PeriodicCycle.end_date;
                match = { '$match': { 'status': 7, 'invoice.status': 1, 'createdAt': { '$gte': startdate, '$lte': enddate } } }
            } else if (results.OnGoingCycle) {
                match = { '$match': { 'status': 7, 'invoice.status': 1, 'createdAt': { '$gte': new Date(results.OnGoingCycle.end_date) } } }
            } else {
                match = { '$match': { 'status': 7, 'invoice.status': 1 } }
            }

            var earningQuery = [
                match,
                { '$group': { '_id': '$tasker', 'count': { '$sum': 1 }, 'paidcount': { '$sum': '$payee_status' }, 'admin_commission': { '$sum': '$invoice.amount.admin_commission' }, 'coupon': { '$sum': '$invoice.amount.coupon' }, 'total': { '$sum': '$invoice.amount.total' }, 'grandtotal': { '$sum': '$invoice.amount.grand_total' }, 'servicetax': { '$sum': '$invoice.amount.service_tax' }, 'tasker': { $first: '$tasker' } } },
                { '$lookup': { from: "tasker", localField: "tasker", foreignField: "_id", as: "tasker" } },
                { $unwind: { path: "$tasker", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: 1,
                        count: 1,
                        paidcount: 1,
                        admin_commission: 1,
                        coupon: 1,
                        total: 1,
                        grandtotal: 1,
                        servicetax: 1,
                        tasker: 1
                    }
                },
                { $group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$$ROOT" } } }
            ];

            var sorting = {};
            var searchs = '';
            var condition = { status: { $ne: 0 } };
            if (Object.keys(req.body).length != 0) {
                earningQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });
                if (req.body.search != '' && req.body.search != 'undefined' && req.body.search) {
                    condition['username'] = { $regex: new RegExp('^' + req.body.search, 'i') };
                    searchs = req.body.search;
                    earningQuery.push({
                        "$match": {
                            $or: [
                                { "documentData.tasker.username": { $regex: searchs + '.*', $options: 'si' } },
                                { "documentData.paidcount": { $regex: searchs + '.*', $options: 'si' } },
                                { "documentData.admin_commission": { $regex: searchs + '.*', $options: 'si' } },
                                { "documentData.count": { $regex: searchs + '.*', $options: 'si' } },
                                { "documentData.total": { $regex: searchs + '.*', $options: 'si' } },
                                { "documentData.grandtotal": { $regex: searchs + '.*', $options: 'si' } },
                                { "documentData.servicetax": { $regex: searchs + '.*', $options: 'si' } }
                            ]
                        }
                    });
                    earningQuery.push({ $group: { "_id": "$_id", "count": { "$sum": 1 }, "documentData": { $first: "$documentData" } } });
                }
                var sorting = {};
                if (req.body.sort) {

                    if (req.body.sort != "" && req.body.sort != 'undefined') {
                        earningQuery.push({ $unwind: { path: "$documentData.tasker", preserveNullAndEmptyArrays: true } });
                        var sorter = 'documentData.tasker.' + req.body.sort.field;
                        sorting[sorter] = req.body.sort.order;
                        earningQuery.push({ $sort: sorting });
                    } else {
                        sorting["documentData.createdAt"] = -1;
                        earningQuery.push({ $sort: sorting });
                    }
                }

                if (req.body.limit != 'undefined' && req.body.skip != 'undefined') {
                    earningQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
                }
                earningQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
            }

            db.GetAggregation('task', earningQuery, function (err, docdata) {
                if (err || !docdata[0]) {
                    res.send([0, 0]);
                } else {
                    res.send([docdata[0].documentData, docdata[0].count]);
                }
            });
        });
    }


    router.paidserivce = function paidserivce(req, res) {

        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }

        async.parallel({
            PeriodicCycle: function (callback) {
                if (req.body.cycle) {
                    db.GetOneDocument('billing', { _id: req.body.cycle }, {}, {}, function (err, billing) {
                        callback(err, billing);
                    });
                } else {
                    callback(null, null);
                }
            },
            OnGoingCycle: function (callback) {
                var ext = {};
                ext.sort = { 'createdAt': -1 }
                db.GetOneDocument('billing', {}, {}, ext, function (err, billing) {
                    callback(err, billing);
                });
            }
        }, function (err, results) {
            if (err) {
                res.send([0, 0]);
            } else {

                var match = {
                    "$match": { status: 7, 'tasker': new mongoose.Types.ObjectId(req.body.tasker), 'invoice.status': 1 }
                };
                if (results.PeriodicCycle) {
                    var startdate = results.PeriodicCycle.start_date;
                    var enddate = results.PeriodicCycle.end_date;
                    match.$match.createdAt = { '$gte': startdate, '$lte': enddate };
                } else if (results.OnGoingCycle) {
                    match.$match.createdAt = { '$gte': new Date(results.OnGoingCycle.end_date) };
                }

                var earningQuery = [
                    match,
                    { $project: { cash: { $cond: { if: { $eq: ["$payment_type", "cash"] }, then: "$$ROOT", else: null } }, gateway: { $cond: { if: { $ne: ["$payment_type", "cash"] }, then: "$$ROOT", else: null } }, 'tasker': 1, } },
                    {
                        '$group': {
                            '_id': '$tasker',
                            'count': { '$sum': 1 },
                            'cash_paid_count': { '$sum': '$cash.payee_status' },
                            'cash_admin_commission': { '$sum': '$cash.invoice.amount.admin_commission' },
                            'cash_coupon': { '$sum': '$cash.invoice.amount.coupon' },
                            'cash_grandtotal': { '$sum': '$cash.invoice.amount.grand_total' },
							'cash_extra_amount': { '$sum': '$cash.invoice.amount.extra_amount' },
                            'cash_total': { '$sum': '$cash.invoice.amount.total' },
                            'cash_servicetax': { '$sum': '$cash.invoice.amount.service_tax' },
                            'gateway_paid_count': { '$sum': '$gateway.payee_status' },
                            'gateway_admin_commission': { '$sum': '$gateway.invoice.amount.admin_commission' },
                            'gateway_coupon': { '$sum': '$gateway.invoice.amount.coupon' },
                            'gateway_grandtotal': { '$sum': '$gateway.invoice.amount.grand_total' },
							'gateway_extra_amount': { '$sum': '$gateway.invoice.amount.extra_amount' },
                            'gateway_total': { '$sum': '$gateway.invoice.amount.total' },
                            'gateway_servicetax': { '$sum': '$gateway.invoice.amount.service_tax' },
                            'tasker': { $first: '$tasker' }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            cash: {
                                admin_commission: '$cash_admin_commission', coupon: '$cash_coupon', grandtotal: '$cash_grandtotal', total: '$cash_total', servicetax: '$cash_servicetax', paid_count: '$cash_paid_count',extra_amount : '$cash_extra_amount'
                            },
                            gateway: {
                                admin_commission: '$gateway_admin_commission', coupon: '$gateway_coupon', grandtotal: '$gateway_grandtotal', total: '$gateway_total', servicetax: '$gateway_servicetax', paid_count: '$gateway_paid_count',extra_amount : '$gateway_extra_amount'
                            },
                            total: {
                                admin_commission: { $sum: ["$cash_admin_commission", "$gateway_admin_commission"] }, coupon: { $sum: ["$cash_coupon", "$gateway_coupon"] }, grandtotal: { $sum: ["$cash_grandtotal", "$gateway_grandtotal"] }, total: { $sum: ["$cash_total", "$gateway_total"] }, servicetax: { $sum: ["$cash_servicetax", "$gateway_servicetax"] }, paid_count: { $sum: ["$cash_paid_count", "$gateway_paid_count"] }, extra_amount: { $sum: ["$cash_extra_amount", "$gateway_extra_amount"] }
                            },
                            count: 1,
                            tasker: 1,
                        }
                    },
                    { '$lookup': { from: "tasker", localField: "tasker", foreignField: "_id", as: "tasker" } },
                    { $unwind: "$tasker" },
                ];

                db.GetAggregation('task', earningQuery, function (err, docdata) {
                    if (err || !docdata[0]) {
                        res.send(err);
                    } else {
                        res.send(docdata[0]);
                    }
                });
            }
        });
    }


    router.updatepayee = function updatepayee(req, res) {
        /*
        var earningQuery = [
            { $match: { 'status': 7, 'tasker': new mongoose.Types.ObjectId(req.body.tasker), 'invoice.status': 1, $or: [{ "payee_status": 0 }, { "payee_status": 1 }, { "payee_status": { $exists: false } }] } },
            { '$group': { '_id': '$tasker', 'task': { $addToSet: '$_id' } } }
        ];
        */
        /*
        db.GetAggregation('task', earningQuery, function (err, docdata) {
            if (err || !docdata[0].task) {
                res.send(err);
            } else {
                var data = req.body;
                data.task = docdata[0].task;

                db.InsertDocument('paid', data, function (err, docdata) {
                    if (err) {
                        res.send(err);
                    } else {
                        db.UpdateDocument('task', { tasker: new mongoose.Types.ObjectId(data.tasker), status: 7, 'invoice.status': 1 }, { 'payee_status': 1 }, { multi: true }, function (err, updatetaskdata) {
                            if (err) {
                                res.send(err);
                            } else {
                                res.send(updatetaskdata);
                            }
                        });
                    }
                });
            }
        });
        */

        async.waterfall([
            function (callback) {
                db.GetOneDocument('billing', { _id: req.body.billing_cycle }, {}, {}, function (err, billing) {
                    callback(err, billing);
                });
            },
            function (billing, callback) {
                var startdate = billing.start_date;
                var enddate = billing.end_date;
                var match = { 'status': 7, 'tasker': new mongoose.Types.ObjectId(req.body.tasker), 'invoice.status': 1, 'createdAt': { '$gte': startdate, '$lte': enddate }, $or: [{ "payee_status": 0 }, { "payee_status": { $exists: false } }] }
                var query = [
                    { $match: match },
                    { '$group': { '_id': '$tasker', 'task': { $addToSet: '$_id' } } }
                ]
                db.GetAggregation('task', query, function (err, tasks) {
                    callback(err, tasks, match);
                });
            },
            function (tasks, match, callback) {
                var data = req.body;
                data.task = tasks[0].task;
                db.InsertDocument('paid', data, function (err, paid) {
                    callback(err, match);
                });
            }
        ], function (err, match) {
            if (err || !match) {
                data.status = '0';
                data.response = 'Errror!';
                res.status(400).send(data);
            } else {
                db.UpdateDocument('task', match, { 'payee_status': 1 }, { multi: true }, function (err, updatetaskdata) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send(updatetaskdata);
                    }
                });
            }
        });
    }

    router.cyclelist = function cyclelist(req, res) {
        var sorting = {};
        sorting['createdAt'] = -1
        var ext = {};
        ext.sort = sorting
        db.GetDocument('billing', {}, {}, ext, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }

    router.getcyclefirst = function getcyclefirst(req, res) {
        var sorting = {};
        sorting['createdAt'] = -1
        var ext = {};
        ext.sort = sorting
        db.GetOneDocument('billing', {}, {}, ext, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }

    router.getearning = function getearning(req, res) {
        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }
        async.parallel({
            PeriodicCycle: function (callback) {
                if (req.body.data.cycle) {
                    db.GetOneDocument('billing', { _id: req.body.data.cycle }, {}, {}, function (err, billing) {
                        callback(err, billing);
                    });
                } else {
                    callback(null, null);
                }
            },
            OnGoingCycle: function (callback) {
                var ext = {};
                ext.sort = { 'createdAt': -1 }
                db.GetOneDocument('billing', {}, {}, ext, function (err, billing) {
                    callback(err, billing);
                });
            }
        }, function (err, results) {
            if (err) {
                res.send([0, 0]);
            } else {

                var match = {
                    "$match": { status: 7, 'tasker': new mongoose.Types.ObjectId(req.body.data.tasker), 'invoice.status': 1 }
                };
                if (results.PeriodicCycle) {
                    var startdate = results.PeriodicCycle.start_date;
                    var enddate = results.PeriodicCycle.end_date;
                    match.$match.createdAt = { '$gte': startdate, '$lte': enddate };
                } else if (results.OnGoingCycle) {
                    match.$match.createdAt = { '$gte': new Date(results.OnGoingCycle.end_date) };
                }

                var usersQuery = [
                    match,
                    { '$lookup': { from: 'tasker', localField: 'tasker', foreignField: '_id', as: 'tasker' } },
                    {
                        $project: {
                            _id: 1,
                            document: "$$ROOT"
                        }
                    }, {
                        $group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
                    }];

                var condition = { status: { $ne: 0 } };
                usersQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });

                if (req.body.search) {
                    condition['booking_id'] = { $regex: new RegExp('^' + req.body.search, 'i') };
                    var searchs = req.body.search;
                    usersQuery.push({
                        "$match": {
                            $or: [
                                { "documentData.booking_id": { $regex: searchs + '.*', $options: 'si' } },
                                { "documentData.booking_information.service_type": { $regex: searchs + '.*', $options: 'si' } },
                                { "documentData.payment_type": { $regex: searchs + '.*', $options: 'si' } }

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

                if ((req.body.limit && req.body.skip >= 0) && (req.body.search == "undefined" || !req.body.search)) {
                    usersQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
                }
                //usersQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
                  if(!req.body.search){
                        usersQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
                    }

                db.GetAggregation('task', usersQuery, function (err, docdata) {
                    if (err) {
                        res.send(err);
                    } else {
                        if (docdata.length != 0) {
                            res.send([docdata[0].documentData, docdata[0].count]);
                        } else {
                            res.send([0, 0]);
                        }
                    }
                });
            }
        });
    };

    return router;
};
