"use strict";

module.exports = function () {

    var mongoose = require('mongoose');
    var db = require('../../controller/adaptor/mongodb.js');

    function validationCoupon(req, res, next) {
        req.checkBody('name', 'coupon name is invalid').notEmpty();
        req.checkBody('code', 'coupon code is required').notEmpty();
        req.checkBody('discount_type', 'discount type is invalid').notEmpty();
        req.checkBody('amount_percentage', 'Amount/Percentage is invalid').notEmpty();
        req.checkBody('usage.total_coupons', 'Usage Limit Per Coupon is invalid').notEmpty();
        req.checkBody('usage.per_user', 'Usage Limit Per User is invalid').notEmpty();
        req.checkBody('valid_from', 'Valid From is invalid').notEmpty();
        req.checkBody('expiry_date', 'Expiry Date is invalid').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }
        return next();
    }


    var controller = {};

    controller.list = function (req, res) {
        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }

        if (req.body.sort) {
            var sorted = req.body.sort.field;
        }


        var couponQuery = [{
            "$match": { status: { $ne: 0 } }
        }, {
                $project: {
                    name: 1,
                    code: 1,
                    amount_percentage: 1,
                    discount_type: 1,
                    dname: { $toLower: '$' + sorted },
                    status: 1
                }
            }, {
                $project: {
                    name: 1,
                    document: "$$ROOT"
                }
            }, {
                $group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
            }];


        var condition = { status: { $ne: 0 } };
        couponQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });

        if (req.body.search) {
            condition['name'] = { $regex: new RegExp('^' + req.body.search, 'i') };
            var searchs = req.body.search;
            couponQuery.push({
               "$match": {
                 $or:[
                   {"documentData.name": { $regex: searchs + '.*', $options: 'si' } },
                   {"documentData.code": { $regex: searchs + '.*', $options: 'si' } },
                   {"documentData.discount_type": { $regex: searchs + '.*', $options: 'si' } },
                   {"documentData.amount_percentage": { $regex: searchs + '.*', $options: 'si' } }
                  ]
                }
                });
                //search limit
             couponQuery.push({$group: { "_id": null, "countvalue": { "$sum": 1 }, "documentData": { $push: "$documentData" } }});
             couponQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });
              if (req.body.limit && req.body.skip >= 0) {
                couponQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
              }
             couponQuery.push({ $group: { "_id": null, "count": { "$first": "$countvalue" }, "documentData": { $push: "$documentData" } } });
//search limit
        }

        var sorting = {};
        if (req.body.sort) {
            var sorter = 'documentData.' + req.body.sort.field;
            sorting[sorter] = req.body.sort.order;
            couponQuery.push({ $sort: sorting });
        } else {
            sorting["documentData.createdAt"] = -1;
            couponQuery.push({ $sort: sorting });
        }

        if ((req.body.limit && req.body.skip >= 0) && !req.body.search) {
            couponQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
        }
        //couponQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
          if(!req.body.search){
            couponQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
 }

        db.GetAggregation('coupon', couponQuery, function (err, docdata) {

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

    controller.deletecoupon = function (req, res) {


        db.UpdateDocument('coupon', { _id: { $in: req.body.delData } }, { status: 0 }, { multi: true }, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }


    controller.editcoupon = function (req, res) {
        db.GetDocument('coupon', { status: { $ne: 0 }, _id: req.body.id }, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata[0]);
            }
        });
    }

    controller.userGet = function (req, res) {
        db.GetDocument('users', { status: { $eq: 1 } }, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }



    controller.save = function (req, res) {

        if (req.body._id) {
            db.UpdateDocument('coupon', { _id: { $in: req.body._id } }, req.body, function (err, result) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    res.send(result);
                }
            });
        } else {
            db.InsertDocument('coupon', req.body, function (err, result) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    res.send(result);
                }
            });
        }
    }

    return controller;
}
