"use strict";
module.exports = function () {
    var mongoose = require('mongoose');
    var attachment = require('../../model/attachments.js');
    var fs = require('fs');
    var db = require('../../controller/adaptor/mongodb.js');
    var path = require('path');

    var controller = {};
    controller.currencyList = function (req, res) {

        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }

        if (req.body.sort) {
            var sorted = req.body.sort.field;
        }

        var currencyQuery = [{
            "$match": { status: { $ne: 0 } }
        }, {
            $project: {
                name: 1,
                default_currency: 1,
                code: 1,
                symbol: 1,
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
        currencyQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });

        if (req.body.search) {
            condition['name'] = { $regex: new RegExp('^' + req.body.search, 'i') };
            var searchs = req.body.search;
            currencyQuery.push({
                "$match": {
                    $or: [
                        { "documentData.name": { $regex: searchs + '.*', $options: 'si' } },
                        { "documentData.code": { $regex: searchs + '.*', $options: 'si' } },
                        { "documentData.symbol": { $regex: searchs + '.*$aus.*', $options: 'x' } }
                    ]
                }
            });
              //search limit
             currencyQuery.push({$group: { "_id": null, "countvalue": { "$sum": 1 }, "documentData": { $push: "$documentData" } }});
             currencyQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });
              if (req.body.limit && req.body.skip >= 0) {
                currencyQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
              }
             currencyQuery.push({ $group: { "_id": null, "count": { "$first": "$countvalue" }, "documentData": { $push: "$documentData" } } });
//search limit
        }

        var sorting = {};
        if (req.body.sort) {
            var sorter = 'documentData.' + req.body.sort.field;
            sorting[sorter] = req.body.sort.order;
            currencyQuery.push({ $sort: sorting });
        } else {
            sorting["documentData.createdAt"] = -1;
            currencyQuery.push({ $sort: sorting });
        }

        if ((req.body.limit && req.body.skip >= 0) && !req.body.search) {
            currencyQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
        }
        //currencyQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
          if(!req.body.search){
            currencyQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
 }

        db.GetAggregation('currencies', currencyQuery, function (err, docdata) {

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

    controller.currencyEdit = function (req, res) {
        if (req.body) {
            req.checkBody('id', 'Invalid id').notEmpty();
            var errors = req.validationErrors();
            if (errors) {
                res.send(errors, 400);
                return;
            }
            db.GetDocument('currencies', { _id: req.body.id }, {}, {}, function (err, docdata) {
                if (err) {
                    res.send(err);
                } else {
                    res.send(docdata);
                }
            });
        }
    }
    controller.mobilesave = function (req, res) {
        var data = { settings: {} };
        data.settings.user_app = req.body.user_app;
        data.settings.tasker_app = req.body.tasker_app;
        data.settings.invite_friends = req.body.invite_friends;
        db.UpdateDocument('settings', { "alias": "mobile" }, data, { upsert: true }, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);

            }
        });
    }

    controller.getmobile = function (req, res) {
        db.GetOneDocument('settings', { alias: 'mobile' }, {}, {}, function (err, docdata) {
            if (err || !docdata) {
                res.send(err);
            } else {
                res.send(docdata.settings);
            }
        });
    }

    controller.currencySave = function (req, res) {
        req.checkBody('name', 'Currency name is invalid').notEmpty();
        req.checkBody('code', 'Currency code is invalid').notEmpty();
        req.checkBody('symbol', 'Currency symbol is invalid').notEmpty();
        req.checkBody('value', 'Currency value is invalid').notEmpty();
        req.checkBody('status', 'Currency status is invalid').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }


        var data = {};
        data.name = req.body.name;
        data.code = req.body.code;
        data.symbol = req.body.symbol;
        data.value = req.body.value;

        if (req.body._id) {
            data.featured = req.body.featured;
            data.status = req.body.status;

            db.UpdateDocument('currencies', { _id: req.body._id }, data, function (err, data) {
                if (err) { res.send(err); }
                else {
                    data.method = 'edit';
                    res.send(data);
                }
            });
        } else {
            data.featured = 0;
            data.status = 1;

            db.InsertDocument('currencies', data, function (err, data) {
                if (err) { res.send(err); }
                else {
                    res.send(data);
                }
            });
        }
    }

    controller.currencyDelete = function (req, res) {
        req.checkBody('delData', 'Invalid delData').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }
        db.RemoveDocument('currencies', { _id: { $in: req.body.delData } }, function (err, docdata) {
            //  db.UpdateDocument('currencies', { _id: { $in: req.body.delData } }, { status: 0 }, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }

    controller.currencyDefaultSave = function (req, res) {
        db.UpdateDocument('currencies', { _id: { $ne: req.body.id } }, { default: 0 }, { multi: true }, function (err1, docdata1) {
            if (err1) {
                res.send(err1);

            } else {
                db.UpdateDocument('currencies', { _id: req.body.id }, { default: 1 }, function (err, docdata) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send(docdata);
                    }
                });
            }
        });
    }

    controller.currencyDefault = function (req, res) {
        db.GetOneDocument('currencies', { default: 1 }, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }


    controller.languagelist = function (req, res) {

        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }

        if (req.body.sort) {
            var sorted = req.body.sort.field;
        }


        var languageQuery = [{
            "$match": { status: { $ne: 0 } }
        }, {
            $project: {
                name: 1,
                default_currency: 1,
                code: 1,
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
        languageQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });

        if (req.body.search) {
            condition['name'] = { $regex: new RegExp('^' + req.body.search, 'i') };
            var searchs = req.body.search;
            languageQuery.push({
                "$match": {
                    $or: [
                        { "documentData.name": { $regex: searchs + '.*', $options: 'si' } },
                        { "documentData.code": { $regex: searchs + '.*', $options: 'si' } }

                    ]
                }
            });
              //search limit
             languageQuery.push({$group: { "_id": null, "countvalue": { "$sum": 1 }, "documentData": { $push: "$documentData" } }});
             languageQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });
              if (req.body.limit && req.body.skip >= 0) {
                languageQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
              }
             languageQuery.push({ $group: { "_id": null, "count": { "$first": "$countvalue" }, "documentData": { $push: "$documentData" } } });
//search limit
        }

        var sorting = {};
        if (req.body.sort) {
            var sorter = 'documentData.' + req.body.sort.field;
            sorting[sorter] = req.body.sort.order;
            languageQuery.push({ $sort: sorting });
        } else {
            sorting["documentData.createdAt"] = -1;
            languageQuery.push({ $sort: sorting });
        }

        if ((req.body.limit && req.body.skip >= 0) && !req.body.search) {
            languageQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
        }
        //languageQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });

        if(!req.body.search){
            languageQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
        }

        db.GetAggregation('languages', languageQuery, function (err, docdata) {

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
    controller.languagegetlanguage = function (req, res) {
        db.GetDocument('languages', { _id: req.params.id }, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }

    controller.getlanguageDetails = function (req, res) {

        fs.readFile(path.join(__dirname, '../../', '/uploads/languages/en.json'), "utf8", function (error, englishRaw) {
            if (error) {
                res.send(error);
            } else {
                var english = JSON.parse(englishRaw);
                var engKeys = Object.keys(english);

                fs.readFile(path.join(__dirname, '../../', '/uploads/languages/' + req.body.code + '.json'), "utf8", function (error, languageRaw) {
                    if (error) {
                        res.send(error);
                    } else {
                        var obj = JSON.parse(languageRaw);
                        var keys = Object.keys(obj);
                        var newarray = [];
                        for (var i = 0; i < engKeys.length; i++) {
                            if (obj[engKeys[i]]) {
                                newarray[engKeys[i]] = obj[engKeys[i]];
                            } else {
                                newarray[engKeys[i]] = '';
                            }
                        }
                        var keysasdasds = Object.keys(newarray);

                        var languageManage = {};
                        languageManage.total = keysasdasds.length;
                        languageManage.data = {};
                        var start = req.body.limit * (req.body.current - 1);
                        var end = req.body.limit + (req.body.limit * (req.body.current - 1));
                        for (var i = start; i < end; i++) {
                            languageManage.data[keysasdasds[i]] = newarray[keysasdasds[i]];
                        }

                        res.send(languageManage);
                    }
                });
            }
        });
    }

    controller.languageedit = function (req, res) {
        req.checkBody('name', 'Language name is invalid').notEmpty();
        req.checkBody('code', 'Invalid language code').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }
        var data = {};
        data.name = req.body.name;
        data.code = req.body.code;
        data.status = req.body.status;
        var obj;
        var objectValue;
        if (req.body._id) {
            db.GetOneDocument('languages', { '_id': req.body._id, status: { $ne: 0 } }, {}, {}, function (err, docdata) {
                if (err) {
                    res.send(err);
                } else {
                    fs.readFile(path.join(__dirname, '../../', '/uploads/languages/' + docdata.code + '.json'), "utf8", function (error, objectdata) {
                        if (error) {
                            res.send(err);
                        }
                        else {
                            obj = JSON.parse(objectdata)
                            objectValue = obj;
                            fs.writeFile(path.join(__dirname, '../../', '/uploads/languages/' + req.body.code + '.json'), JSON.stringify(objectValue, null, 4), function (err, respo) {
                                if (err) {
                                    res.send(err);
                                } else {
                                    db.UpdateDocument('languages', { _id: { $in: req.body._id } }, data, function (err, result) {
                                        if (err) { res.send(err); }
                                        else { res.send(result); }
                                    });
                                }
                            });
                        }

                    });
                }

            });
        } else {
            db.GetOneDocument('languages', { 'code': req.body.code, status: { $ne: 0 } }, {}, {}, function (err, docdata) {
                if (err) {
                    res.send(err);
                } else {
                    if (docdata != null) {
                        res.status(400).send({ message: 'Language is Already Exist' });
                    } else {
                        fs.readFile(path.join(__dirname, '../../', '/uploads/languages/en.json'), "utf8", function (error, objectdata) {
                            if (error) {
                                db.GetOneDocument('languages', { default: 1, status: 1 }, {}, {}, function (err, defaultdata) {
                                    if (err) {
                                        res.send(err);
                                    } else {
                                        fs.readFile(path.join(__dirname, '../../', '/uploads/languages/' + defaultdata.code + '.json'), "utf8", function (error, objectdata) {
                                            if (error) {
                                                res.send(err);
                                            } else {
                                                obj = JSON.parse(objectdata)
                                                objectValue = obj;
                                                fs.writeFile(path.join(__dirname, '../../', '/uploads/languages/' + req.body.code + '.json'), JSON.stringify(objectValue, null, 4), function (err, respo) {
                                                    if (err) {
                                                        res.send(err);
                                                    } else {
                                                        db.InsertDocument('languages', data, function (err, result) {
                                                            if (err) { res.send(err); }
                                                            else { res.send(result); }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            } else {
                                obj = JSON.parse(objectdata)
                                objectValue = obj;
                                fs.writeFile(path.join(__dirname, '../../', '/uploads/languages/' + req.body.code + '.json'), JSON.stringify(objectValue, null, 4), function (err, respo) {
                                    if (err) {
                                        res.send(err);
                                    } else {
                                        db.InsertDocument('languages', data, function (err, result) {
                                            if (err) { res.send(err); }
                                            else { res.send(result); }
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
    }

    controller.languageSaveTranslation = function (req, res) {

        req.checkBody('id', 'Invalid Id').notEmpty();
        req.checkBody('data', 'Invalid Data').notEmpty();
        var errors = req.validationErrors();
        if (errors) { res.send(errors, 400); return; }

        fs.readFile(path.join(__dirname, '../../', '/uploads/languages/en.json'), "utf8", function (error, englishRaw) {
            if (error) {
                res.send(error);
            } else {
                var english = JSON.parse(englishRaw);
                var engKeys = Object.keys(english);
                fs.readFile(path.join(__dirname, '../../', '/uploads/languages/' + req.body.id + '.json'), "utf8", function (error, objectdata) {
                    if (error) {

                    } else {
                        var obj = JSON.parse(objectdata)
                        var orgKeys = Object.keys(obj);

                        var newarray = {};
                        for (var i = 0; i < engKeys.length; i++) {
                            if (obj[engKeys[i]]) {
                                newarray[engKeys[i]] = obj[engKeys[i]];
                            } else {
                                newarray[engKeys[i]] = '';
                            }
                        }
                        var keysasdasds = Object.keys(newarray);

                        var keys = Object.keys(req.body.data);
                        for (var i = 0; i < keysasdasds.length; i++) {
                            if (req.body.data[keysasdasds[i]]) {
                                newarray[keysasdasds[i]] = req.body.data[keysasdasds[i]];
                            }

                            if (!newarray[keysasdasds[i]]) {
                                delete newarray[keysasdasds[i]];
                            }
                        }

                        var outputfile = path.join(__dirname, "../../", '/uploads/languages/' + req.body.id + ".json");
                        fs.writeFile(outputfile, JSON.stringify(newarray, null, 4), function (err) {
                            if (err) {
                                res.send(err);
                            } else {
                                res.send(outputfile);
                            }
                        });

                    }
                });
            }
        });
    }

    controller.languageTranslation = function (req, res) {
        req.checkBody('code', 'Invalid Code').notEmpty();
        var errors = req.validationErrors();
        if (errors) { res.send(errors, 400); return; }

        db.GetOneDocument('languages', { 'status': 1, 'code': req.body.code }, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }

    controller.languageGetTranslation = function (req, res) {
        db.GetOneDocument('languages', { 'status': 1, 'code': 'en' }, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata.translation);
            }
        });
    }

    controller.languagedelete = function (req, res) {
        req.checkBody('delData', 'Invalid delData').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }
        //db.RemoveDocument('languages', { _id: { $in: req.body.delData } }, function (err, docdata) {
        db.UpdateDocument('languages', { _id: { $in: req.body.delData } }, { status: 0 }, { multi: true }, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }

    controller.languagedefaultsave = function (req, res) {
        db.GetOneDocument('languages', { _id: { $eq: req.body.id }, status: { $eq: 1 } }, {}, {}, function (err, docdata) {
            if (docdata) {
                db.UpdateDocument('languages', { _id: { $ne: req.body.id } }, { default: 0 }, { multi: true }, function (err, docdata) {
                    if (err) {
                        res.send(err);
                    } else {
                        db.UpdateDocument('languages', { _id: req.body.id }, { default: 1 }, function (err, docdata) {
                            if (err) {
                                res.send(err);
                            } else {
                                res.send(docdata);
                            }
                        });
                    }
                });
            } else {
                res.status(400).send("Can't set Default language to status of unpublish Please choose some other language or else change the status ");
            }
        });
    }

    controller.languagedefault = function (req, res) {
        db.GetOneDocument('languages', { default: 1 }, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }

    controller.general = function (req, res) {
        db.GetDocument('settings', { alias: "general" }, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                //console.log("docdata/////////////////////",docdata);
                res.send(docdata[0].settings);
            }
        });
    }

    controller.themecolor = function (req, res) {
        db.GetDocument('settings', { alias: "appearance" }, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                //console.log("docdata/////////////////////",docdata);
                res.send(docdata[0].settings);
            }
        });
    }


    controller.timezones = function (req, res) {
        var timezone = require('moment-timezone');
        var timezoneData = timezone.tz.names();
        res.send(timezoneData);
    };

    controller.save = function (req, res) {
        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }

        var data = { settings: { wallet: { amount: {} } } };

        data.settings.site_title = req.body.site_title;
        data.settings.site_url = req.body.site_url;
        data.settings.email_address = req.body.email_address;
        data.settings.admin_commission = req.body.admin_commission;
        data.settings.minimum_amount = req.body.minimum_amount;
        data.settings.service_tax = req.body.service_tax;
        data.settings.billingcycle = req.body.billingcycle;
        data.settings.bookingIdPrefix = req.body.bookingIdPrefix;
        data.settings.time_zone = req.body.time_zone;
        if (req.body.datekeyformat) {
            data.settings.date_format = req.body.datekeyformat;
        }
        else {
            data.settings.date_format = req.body.date_format;
        }
        data.settings.time_format = req.body.time_format;


        data.settings.wallet.amount.minimum = req.body.wallet.amount.minimum;
        data.settings.wallet.amount.maximum = req.body.wallet.amount.maximum;
        data.settings.wallet.amount.welcome = req.body.wallet.amount.welcome;
        data.settings.wallet.status = req.body.wallet.status;

        var pay_by_cash = {};
        data.settings.pay_by_cash = req.body.pay_by_cash;

        var referral = {};
        data.settings.referral = req.body.referral;

       var categorycommission = {};
        data.settings.categorycommission = req.body.categorycommission;

        // data.settings.categorycommission = req.body.categorycommission;


        if (typeof req.files.logo != 'undefined') {
            if (req.files.logo.length > 0) {
                data.settings.logo = attachment.get_attachment(req.files.logo[0].destination, req.files.logo[0].filename);
                data.img_name = encodeURI(req.files.logo[0].filename);
                data.img_path = req.files.logo[0].destination.substring(2);
            }
        } else {
            data.settings.logo = req.body.logo;
        }

        if (typeof req.files.favicon != 'undefined') {
            if (req.files.favicon.length > 0) {
                data.settings.favicon = attachment.get_attachment(req.files.favicon[0].destination, req.files.favicon[0].filename);
            }
        } else {
            data.settings.favicon = req.body.favicon;
        }
        db.UpdateDocument('settings', { "alias": "general" }, data, { upsert: true }, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });

    }

    controller.seo = function (req, res) {
        db.GetOneDocument('settings', { alias: 'seo' }, {}, {}, function (err, docdata) {
            if (err || !docdata) {
                res.send(err);
            } else {
                res.send(docdata.settings);
            }
        });
    }



    controller.seosave = function (req, res) {

        var data = { settings: { webmaster: {} } };
        data.settings.seo_title = req.body.seo_title;
        data.settings.focus_keyword = req.body.focus_keyword;
        data.settings.meta_description = req.body.meta_description;
        data.settings.webmaster.google_analytics = req.body.webmaster.google_analytics;
        data.settings.webmaster.google_html_tag = req.body.webmaster.google_html_tag;
        db.UpdateDocument('settings', { "alias": "seo" }, data, { upsert: true }, function (err, docdata) {

            if (err) {
                res.send(err);
            } else {
                res.send(docdata);

            }
        });
    }


    controller.widgets = function (req, res) {
        // db.GetDocument('settings',{},{widgets:1},function(err,docdata){
        db.GetOneDocument('settings', { alias: 'widgets' }, {}, {}, function (err, docdata) {
            if (err || !docdata) {
                res.send(err);
            } else {
                res.send(docdata.settings);
            }
        });
    }


    controller.widgetssave = function (req, res) {
        var data = { settings: {} };
        data.settings.footer_widgets_1 = req.body.footer_widgets_1;
        data.settings.footer_widgets_2 = req.body.footer_widgets_2;
        data.settings.footer_widgets_3 = req.body.footer_widgets_3;
        data.settings.footer_widgets_4 = req.body.footer_widgets_4;
        data.settings.footer_widgets_5 = req.body.footer_widgets_5;
        data.settings.how_quickrabbit_works = req.body.how_quickrabbit_works;
        data.settings.features = req.body.features;
        data.settings.why_use_quickrabbit = req.body.why_use_quickrabbit;
        db.UpdateDocument('settings', { "alias": "widgets" }, data, { upsert: true }, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }

    controller.smtp = function (req, res) {
        db.GetOneDocument('settings', { alias: 'smtp' }, {}, {}, function (err, docdata) {
            if (err || !docdata) {
                res.send(err);
            } else {
                res.send(docdata.settings);
            }
        });
    }

    controller.smtpsave = function (req, res) {

        req.checkBody('smtp_host', 'host is invalid').notEmpty();
        req.checkBody('smtp_port', 'Invalid port').notEmpty();
        req.checkBody('smtp_username', 'Username is invalid').notEmpty();
        req.checkBody('smtp_password', 'Invalid password').notEmpty();
        req.checkBody('mode', 'Invalid password').notEmpty();

        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }

        var data = { settings: {} };
        data.settings.smtp_host = req.body.smtp_host;
        data.settings.smtp_port = req.body.smtp_port;
        data.settings.smtp_username = req.body.smtp_username;
        data.settings.smtp_password = req.body.smtp_password;
        data.settings.mode = req.body.mode;
        db.UpdateDocument('settings', { "alias": "smtp" }, data, { upsert: true }, function (err, docdata) {

            if (err || !docdata) {
                res.send(err);
            } else {
                res.send(docdata);

            }
        });
    }

    controller.sms = function (req, res) {
        db.GetOneDocument('settings', { alias: 'sms' }, {}, {}, function (err, docdata) {
            if (err || !docdata) {
                res.send(err);
            } else {
                res.send(docdata.settings);
            }
        });
    }


    controller.smssave = function (req, res) {

        req.checkBody('twilio.account_sid', 'id is invalid').notEmpty();
        req.checkBody('twilio.authentication_token', 'Invalid token').notEmpty();
        req.checkBody('twilio.default_phone_number', 'phonenumber is invalid').notEmpty();

        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }

        var data = { settings: { twilio: {} } };
        data.settings.twilio.account_sid = req.body.twilio.account_sid;
        data.settings.twilio.authentication_token = req.body.twilio.authentication_token;
        data.settings.twilio.default_phone_number = req.body.twilio.default_phone_number;
        data.settings.twilio.mode = req.body.twilio.mode;

        db.UpdateDocument('settings', { "alias": "sms" }, data, { upsert: true }, function (err, docdata) {

            if (err || !docdata) {
                res.send(err);
            } else {
                res.send(docdata);

            }
        });
    }

    controller.socialnetworks = function (req, res) {
        db.GetOneDocument('settings', { alias: 'social_networks' }, {}, {}, function (err, docdata) {
            if (err || !docdata) {
                res.send(err);
            } else {
                res.send(docdata.settings);
            }
        });
    }

    controller.walletSetting = function (req, res) {
        var data = {};
        data = { settings: { wallet: {} } };
        data.settings.wallet.status = req.body.status;

        db.UpdateDocument('settings', { alias: 'general' }, { $set: { "settings.wallet.status": req.body.status } }, { multi: false }, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }

    controller.categorySetting = function (req, res) {
        var data = {};
        data = { settings: { categorycommission: {} } };
        data.settings.categorycommission.status = req.body.status;

        db.UpdateDocument('settings', { alias: 'general' }, { $set: { "settings.categorycommission.status": req.body.status } }, { multi: false }, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }

    controller.cashSetting = function (req, res) {
        var data = {};
        data = { settings: { pay_by_cash: {} } };
        data.settings.pay_by_cash.status = req.body.status;

        db.UpdateDocument('settings', { alias: 'general' }, { $set: { "settings.pay_by_cash.status": req.body.status } }, { multi: false }, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }


    controller.referralStatus = function (req, res) {
        var data = {};
        data = { settings: { referral: {} } };
        data.settings.referral.status = req.body.status;

        db.UpdateDocument('settings', { alias: 'general' }, { $set: { "settings.referral.status": req.body.status } }, { multi: false }, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }

    controller.socialnetworkssave = function (req, res) {
        var data = { settings: { link: {}, facebook_api: {}, google_api: {}, twitter_api: {} } };

        data.settings.link.facebook = req.body.link.facebook;
        data.settings.link.twitter = req.body.link.twitter;
        data.settings.link.google_plus = req.body.link.google_plus;
        data.settings.link.pinterest = req.body.link.pinterest;

        data.settings.facebook_api.application_id = req.body.facebook_api.application_id;
        data.settings.facebook_api.application_secret = req.body.facebook_api.application_secret;

        data.settings.google_api.client_id = req.body.google_api.client_id;
        data.settings.google_api.secret_key = req.body.google_api.secret_key;
        data.settings.google_api.developer_key = req.body.google_api.developer_key;
        data.settings.google_api.callback = req.body.google_api.callback;

        data.settings.twitter_api.consumer_key = req.body.twitter_api.consumer_key;
        data.settings.twitter_api.secret_key = req.body.twitter_api.secret_key;

        db.UpdateDocument('settings', { "alias": "social_networks" }, data, { upsert: true }, function (err, docdata) {
            if (err || !docdata) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }
    return controller;
}
