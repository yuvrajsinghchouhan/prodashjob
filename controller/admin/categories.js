"use strict";

module.exports = function () {
    var mongoose = require('mongoose');
    var db = require('../../controller/adaptor/mongodb.js');
    var attachment = require('../../model/attachments.js');
    var Jimp = require("jimp");
    var fs = require("fs");

    var controller = {};

    controller.savecategory = function (req, res) {
        req.checkBody('status', 'Invalid status').notEmpty();
        req.checkBody('name', 'Invalid name').notEmpty();
        req.checkBody('slug', 'Invalid slug').notEmpty();
        req.checkBody('seo.title', 'Invalid title').notEmpty();
        req.checkBody('seo.keyword', 'Invalid keyword').notEmpty();
        if (req.body.parent) {
            req.checkBody('commision', 'Invalid Commision').notEmpty();
        }
        // console.log('req.files.icon',req.files)
        var errors = req.validationErrors();
        if (errors) {
            res.send(errors);
            return;
        }

        console.log('>>>>>>>>>>>>>>>>>>>>>>>')
        console.log(req.files)
        console.log('>>>>>>>>>>>>>>>>>>>>>>>')

        if (typeof req.files.image != 'undefined') {
            if (req.files.image.length > 0) {
                req.body.image = attachment.get_attachment(req.files.image[0].destination, req.files.image[0].filename);
                req.body.img_name = encodeURI(req.files.image[0].filename);
                req.body.img_path = req.files.image[0].destination.substring(2);
            }
        }

        if (typeof req.files.marker != 'undefined') {
            if (req.files.marker.length > 0) {
                fs.readFile(req.files.marker[0].destination + req.files.marker[0].filename, function (err, data) {
                    fs.writeFile(req.files.marker[0].destination + "marker/" + req.files.marker[0].filename, data, function (err) {
                        fs.unlink(req.files.marker[0].destination + req.files.marker[0].filename, function () {
                            if (err) throw err;
                        });
                    });
                });
                req.body.marker = attachment.get_attachment(req.files.marker[0].destination + "marker/", req.files.marker[0].filename);
            }
        }

        if (typeof req.files.icon != 'undefined') {
            if (req.files.icon.length > 0) {
                fs.readFile(req.files.icon[0].destination + req.files.icon[0].filename, function (err, data) {
                    fs.writeFile(req.files.icon[0].destination + "icon/" + req.files.icon[0].filename, data, function (err) {
                        fs.unlink(req.files.icon[0].destination + req.files.icon[0].filename, function () {
                            if (err) throw err;
                        });
                    });
                });
                req.body.icon = attachment.get_attachment(req.files.icon[0].destination + "icon/", req.files.icon[0].filename);
            }
        }

        if (typeof req.files.activeicon != 'undefined') {
            if (req.files.activeicon.length > 0) {
                fs.readFile(req.files.activeicon[0].destination + req.files.activeicon[0].filename, function (err, data) {
                    fs.writeFile(req.files.activeicon[0].destination + "icon/" + req.files.activeicon[0].filename, data, function (err) {
                        fs.unlink(req.files.activeicon[0].destination + req.files.activeicon[0].filename, function () {
                            if (err) throw err;
                        });
                    });
                });
                req.body.activeicon = attachment.get_attachment(req.files.activeicon[0].destination + "icon/", req.files.activeicon[0].filename);
            }
        }


        if (req.body._id) {
            db.UpdateDocument('category', { _id: req.body._id }, req.body, { multi: true }, function (err, docdata) {
                if (err) {
                    res.send(err);
                } else {
                    res.send(docdata);
                }
            });
        } else {
            // console.log(">>>>", req.body);
            db.InsertDocument('category', req.body, function (err, result) {
                if (err) {
                    res.send(err);
                } else {
                    res.send(result);
                }
            });
        }
    }



    controller.savesubcategory = function (req, res) {


        req.checkBody('status', 'Invalid status').notEmpty();
        req.checkBody('name', 'Invalid name').notEmpty();
        req.checkBody('slug', 'Invalid slug').notEmpty();
        req.checkBody('seo.title', 'Invalid title').notEmpty();
        req.checkBody('seo.keyword', 'Invalid keyword').notEmpty();
        if (req.body.parent) {
            req.checkBody('commision', 'Invalid Commision').notEmpty();
        }
        // console.log('req.files.icon',req.files)
        var errors = req.validationErrors();
        if (errors) {
            res.send(errors);
            return;
        }

        if (typeof req.files.image != 'undefined') {
            if (req.files.image.length > 0) {
                req.body.image = attachment.get_attachment(req.files.image[0].destination, req.files.image[0].filename);
                req.body.img_name = encodeURI(req.files.image[0].filename);
                req.body.img_path = req.files.image[0].destination.substring(2);
            }
        }

        if (typeof req.files.icon != 'undefined') {
            if (req.files.icon.length > 0) {
                fs.readFile(req.files.icon[0].destination + req.files.icon[0].filename, function (err, data) {
                    fs.writeFile(req.files.icon[0].destination + "icon/" + req.files.icon[0].filename, data, function (err) {
                        fs.unlink(req.files.icon[0].destination + req.files.icon[0].filename, function () {
                            if (err) throw err;
                        });
                    });
                });
                req.body.icon = attachment.get_attachment(req.files.icon[0].destination + "icon/", req.files.icon[0].filename);
            }
        }

        if (typeof req.files.activeicon != 'undefined') {
            if (req.files.activeicon.length > 0) {
                fs.readFile(req.files.activeicon[0].destination + req.files.activeicon[0].filename, function (err, data) {
                    fs.writeFile(req.files.activeicon[0].destination + "icon/" + req.files.activeicon[0].filename, data, function (err) {
                        fs.unlink(req.files.activeicon[0].destination + req.files.activeicon[0].filename, function () {
                            if (err) throw err;
                        });
                    });
                });
                req.body.activeicon = attachment.get_attachment(req.files.activeicon[0].destination + "icon/", req.files.activeicon[0].filename);
            }
        }

       // console.log('req.body.activeicon', req.body)

        if (req.body._id) {
            db.UpdateDocument('category', { _id: req.body._id }, req.body, { multi: true }, function (err, docdata) {
                if (err) {
                    res.send(err);
                } else {
                    res.send(docdata);
                }
            });
        } else {
            // console.log(">>>>", req.body);
            db.InsertDocument('category', req.body, function (err, result) {
                if (err) {
                    res.send(err);
                } else {
                    res.send(result);
                }
            });
        }
    }


    controller.edit = function (req, res) {
        db.GetOneDocument('category', { _id: req.body.id }, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    };


    controller.getSetting = function (req, res) {
        db.GetDocument('settings', { alias: 'general' }, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    };

    controller.list = function (req, res) {
        if (req.query.sort != "") {
            var sorted = req.query.sort;
        }
        var categoryQuery = [{
            "$match": { status: { $ne: 0 }, parent: { $exists: false } }
        }, {
            $project: {
                name: 1,
                image: 1,
                status: 1,
                dname: { $toLower: '$' + sorted }
            }
        }, {
            $project: {
                name: 1,
                document: "$$ROOT"
            }
        }, {
            $group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
        }];

        var sorting = {};
        var searchs = '';

        var condition = { status: { $ne: 0 } };

        if (Object.keys(req.query).length != 0) {
            categoryQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });

            if (req.query.search != '' && req.query.search != 'undefined' && req.query.search) {
                condition['name'] = { $regex: new RegExp('^' + req.query.search, 'i') };
                searchs = req.query.search;
                categoryQuery.push({ "$match": { "documentData.name": { $regex: searchs + '.*', $options: 'si' } } });
                //search limit
                categoryQuery.push({ $group: { "_id": null, "countvalue": { "$sum": 1 }, "documentData": { $push: "$documentData" } } });
                categoryQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });
                if (req.body.limit && req.body.skip >= 0) {
                    categoryQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
                }
                categoryQuery.push({ $group: { "_id": null, "count": { "$first": "$countvalue" }, "documentData": { $push: "$documentData" } } });
                //search limit
            }
            if (req.query.sort !== '' && req.query.sort) {
                sorting = {};
                if (req.query.status == 'false') {
                    sorting["documentData.dname"] = -1;
                    categoryQuery.push({ $sort: sorting });
                } else {
                    sorting["documentData.dname"] = 1;
                    categoryQuery.push({ $sort: sorting });
                }
            }
            if (req.query.limit != 'undefined' && req.query.skip != 'undefined') {
                categoryQuery.push({ '$skip': parseInt(req.query.skip) }, { '$limit': parseInt(req.query.limit) });
            }
            //categoryQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
            if (!req.body.search) {
                categoryQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
            }
        }


        db.GetAggregation('category', categoryQuery, function (err, docdata) {
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

    controller.subcategorylist = function (req, res) {
        if (req.query.sort != "") {
            var sorted = req.query.sort;
        }
        var categoryQuery = [{
            "$match": { status: { $ne: 0 }, parent: { $exists: true } }
        },
        { $lookup: { from: 'categories', localField: "parent", foreignField: "_id", as: "categoryName" } },
        {
            $project: {
                name: 1,
                image: 1,
                status: 1,
                dname: { $toLower: '$' + sorted },
                categoryName: 1
            }
        }, {
            $project: {
                name: 1,
                document: "$$ROOT"
            }
        }, {
            $group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
        }];

        var sorting = {};
        var searchs = '';

        var condition = { status: { $ne: 0 } };

        if (Object.keys(req.query).length != 0) {
            categoryQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });

            if (req.query.search != '' && req.query.search != 'undefined' && req.query.search) {
                condition['name'] = { $regex: new RegExp('^' + req.query.search, 'i') };
                searchs = req.query.search;
                categoryQuery.push({ "$match": { "documentData.name": { $regex: searchs + '.*', $options: 'si' } } });
                //search limit
                categoryQuery.push({ $group: { "_id": null, "countvalue": { "$sum": 1 }, "documentData": { $push: "$documentData" } } });
                categoryQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });
                if (req.body.limit && req.body.skip >= 0) {
                    categoryQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
                }
                categoryQuery.push({ $group: { "_id": null, "count": { "$first": "$countvalue" }, "documentData": { $push: "$documentData" } } });
                //search limit
            }
            if (req.query.sort !== '' && req.query.sort) {
                sorting = {};
                if (req.query.status == 'false') {
                    sorting["documentData.dname"] = -1;
                    categoryQuery.push({ $sort: sorting });
                } else {
                    sorting["documentData.dname"] = 1;
                    categoryQuery.push({ $sort: sorting });
                }
            }
            if (req.query.limit != 'undefined' && req.query.skip != 'undefined') {
                categoryQuery.push({ '$skip': parseInt(req.query.skip) }, { '$limit': parseInt(req.query.limit) });
            }
            //categoryQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });

            if (!req.body.search) {
                categoryQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
            }
        }


        db.GetAggregation('category', categoryQuery, function (err, docdata) {
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

    controller.getcatlistdropdown = function (req, res) {
        db.GetDocument('category', { status: { $ne: 0 } }, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }

    controller.getsubcatlistdropdown = function (req, res) {
        db.GetDocument('category', { status: { $ne: 0 }, parent: { $exists: false } }, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }

    controller.deletepage = function (req, res) {
        req.checkBody('delData', 'Invalid delData').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }
        db.UpdateDocument('category', { _id: { $in: req.body.delData } }, { 'status': 0 }, { multi: true }, function (err, docdata) {

            // db.DeleteDocument('category', {_id:{$in:req.body.delData}},function(err,docdata){
            if (err) {
                res.send(err);
            } else {

                res.send(docdata);
            }
        });
    }

    controller.deleteMaincategory = function (req, res) {
        req.checkBody('delData', 'Invalid delData').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }
        db.UpdateDocument('category', { _id: { $in: req.body.delData } }, { 'status': 0 }, { multi: true }, function (err, docdata) {

            // db.DeleteDocument('category', {_id:{$in:req.body.delData}},function(err,docdata){
            if (err) {
                res.send(err);
            } else {
                db.UpdateDocument('category', { parent: { $in: req.body.delData } }, { 'status': 0 }, { multi: true }, function (err, docdata) {

                    // db.DeleteDocument('category', {parent:{$in:req.body.delData}},function(err,docdata){
                    if (err) {
                        res.send(err);
                    } else {

                        res.send(docdata);
                    }
                });
            }
        });
    }

    controller.allCategories = function allCategories(req, res) {
        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }

        if (req.body.sort) {
            var sorted = req.body.sort.field;
        }


        var categoryQuery = [{
            "$match": { status: { $ne: 0 }, parent: { $exists: false } }
        }, {
            $project: {
                name: 1,
                image: 1,
                status: 1,
                dname: { $toLower: '$' + sorted }
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
        categoryQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });

        if (req.body.search) {
            condition['name'] = { $regex: new RegExp('^' + req.body.search, 'i') };
            var searchs = req.body.search;
            categoryQuery.push({ "$match": { "documentData.name": { $regex: searchs + '.*', $options: 'si' } } });
            //search limit
            categoryQuery.push({ $group: { "_id": null, "countvalue": { "$sum": 1 }, "documentData": { $push: "$documentData" } } });
            categoryQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });
            if (req.body.limit && req.body.skip >= 0) {
                categoryQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
            }
            categoryQuery.push({ $group: { "_id": null, "count": { "$first": "$countvalue" }, "documentData": { $push: "$documentData" } } });
            //search limit
        }

        var sorting = {};
        if (req.body.sort) {
            var sorter = 'documentData.' + req.body.sort.field;
            sorting[sorter] = req.body.sort.order;
            categoryQuery.push({ $sort: sorting });
        } else {
            sorting["documentData.createdAt"] = -1;
            categoryQuery.push({ $sort: sorting });
        }

        if ((req.body.limit && req.body.skip >= 0) && !req.body.search) {
            categoryQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
        }
        //categoryQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
        if (!req.body.search) {
            categoryQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
        }

        db.GetAggregation('category', categoryQuery, function (err, docdata) {
            /*if (err || docdata.length <= 0) {
                res.send([0, 0]);
            } else {

                res.send([docdata[0].documentData, docdata[0].count]);
            }*/
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
    };



    controller.allSubCategories = function allSubCategories(req, res) {

        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }

        if (req.body.sort) {
            var sorted = req.body.sort.field;
        }


        var categoryQuery = [{
            "$match": { status: { $ne: 0 }, parent: { $exists: true } }
        },
        { $lookup: { from: 'categories', localField: "parent", foreignField: "_id", as: "categoryName" } },
        {
            $project: {
                name: 1,
                image: 1,
                status: 1,
                dname: { $toLower: '$' + sorted },
                categoryName: 1
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
        categoryQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });

        if (req.body.search) {
            condition['name'] = { $regex: new RegExp('^' + req.body.search, 'i') };
            var searchs = req.body.search;
            categoryQuery.push({

                "$match": {
                    $or: [
                        { "documentData.name": { $regex: searchs + '.*', $options: 'si' } },
                        { "documentData.categoryName.name": { $regex: searchs + '.*', $options: 'si' } },
                    ]
                }

            });
        }

        var sorting = {};
        if (req.body.sort) {
            var sorter = 'documentData.' + req.body.sort.field;
            sorting[sorter] = req.body.sort.order;
            categoryQuery.push({ $sort: sorting });
        } else {
            sorting["documentData.createdAt"] = -1;
            categoryQuery.push({ $sort: sorting });
        }

        if ((req.body.limit && req.body.skip >= 0) && !req.body.search) {
            categoryQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
        }
        categoryQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });

        db.GetAggregation('category', categoryQuery, function (err, docdata) {
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
    };

    return controller;
}
