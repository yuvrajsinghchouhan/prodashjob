var db = require('../../controller/adaptor/mongodb.js');
var attachment = require('../../model/attachments.js');
var middlewares = require('../../model/middlewares.js');
var async = require('async');
var mongoose = require('mongoose');
var mailcontent = require('../../model/mailcontent.js');

module.exports = function () {

    var router = {};
    router.getMainData = function (req, res) {
        var data = {};
        async.parallel({
            settings: function (callback) {
                db.GetDocument('settings', { alias: { $in: ['general', 'seo', 'social_networks', 'widgets'] } }, {}, {}, function (err, settings) {
                    callback(err, settings);
                });
            },
            languages: function (callback) {
                db.GetDocument('languages', { 'status': 1 }, {}, {}, function (err, languages) {
                    callback(err, languages);
                });
            },
            images: function (callback) {
                db.GetDocument('images', { imagefor: { $in: ['loginpage', 'taskersignup', 'backgroundimage', 'taskerprofile', 'adminlogin'] } }, {}, {}, function (err, images) {
                    callback(err, images);
                });
            },
            currencies: function (callback) {
                db.GetDocument('currencies', { 'status': 1 }, {}, {}, function (err, currencies) {
                    callback(err, currencies);
                });
            }
        }, function (err, result) {
            if (err || !result) {
                data.response = 'No Data';
                res.send(data);
            } else {
                data.response = [];
                data.response.push({ 'settings': result.settings[0].settings });
                data.response.push({ 'seo': result.settings[1].settings });
                data.response.push({ 'social': result.settings[2].settings });
                data.response.push({ 'languages': result.languages });
                data.response.push({ 'widgets': result.settings[3].settings });
                data.response.push({ 'images': result.images });
                data.response.push({ 'currencies': result.currencies });
                res.send(data);
            }
        });
    }

    router.getlandingdata = function (req, res) {
        var data = {};
        async.parallel({
            ActiveCategory: function (callback) {
                db.GetDocument('category', { 'status': 1, 'parent': { $exists: false } }, {}, {}, function (err, provider) {
                    if (err) {
                        callback(err, provider);
                    } else {
                        var category = [];
                        if (provider.length < 9) {
                            for (var i = 0; i < provider.length; i++) {
                                category.push(provider[i])
                            }
                        }
                        else {
                            for (var i = 0; i < 9; i++) {
                                category.push(provider[i])
                            }

                        }
                        callback(err, category);
                    }
                });
            },
            Categorylength: function (callback) {


                db.GetDocument('category', { 'status': 1, 'parent': { $exists: false } }, {}, {}, function (err, categorylength) {
                    if (err) {
                        callback(err, categorylength);
                    } else {

                        callback(err, categorylength);
                    }
                });
            },
            Postheader: function (callback) {
                db.GetDocument('postheader', { 'status': 1 }, {}, {}, function (err, postheader) {
                    callback(err, postheader);
                });
            },
            Settings: function (callback) {
                db.GetOneDocument('settings', { alias: 'general' }, {}, {}, function (err, settings) {
                    callback(err, settings);
                });
            },
            slider: function (callback) {
                db.GetDocument('slider', { status: 1 }, {}, {}, function (err, settings) {
                    callback(err, settings);
                });
            }
        }, function (err, result) {
            if (err || !result) {
                data.response = 'No Data';
                res.send(data);
            } else {
                data.response = [];
                data.response.push({ 'ActiveCategory': result.ActiveCategory });
                data.response.push({ 'PostHeader': result.Postheader });
                data.response.push({ 'Settings': result.Settings });
                data.response.push({ 'slider': result.slider });
                data.response.push({ 'Category': result.Categorylength });
                res.send(data);
            }
        });
    }


    router.getmorecategory = function (req, res) {
        var getQuery = [{
            "$match": { $and: [{ 'status': { $eq: 1 }, 'parent': { "$exists": false } }] }
        },
        {
            $project: {
                id: 1,
                name: 1,
                slug: 1,
                image: 1,
            }
        },

        {
            $skip: parseInt(req.body.data)
        }
        ];


        db.GetAggregation('category', getQuery, function (err, doc) {
            if (err) {
                res.send(err);
            } else {
                if (doc.length != 0) {

                    res.send(doc);
                } else {
                    res.send([0, 0]);
                }
            }
        });
    }



    router.searchSuggestions = function (req, res) {
        var data = req.body.data;
        var name = new RegExp(data, 'i');
        db.GetAggregation('category', [
            { $match: { $and: [{ 'status': { $ne: 0 }, 'parent': { "$exists": false } }, { $or: [{ 'name': { $regex: name } }, { 'skills.tags': { $regex: name } }] }] } },
            { $project: { _id: '$_id', name: '$name', slug: '$slug', parent: '$parent', skills: '$skills' } }
        ], function (err, doc) {

            if (err) {
                res.send(err);
            } else {
                res.send(doc);
            }
        });
    }

    router.subscription = function (req, res) {
        db.GetOneDocument('newsletter', { 'email': req.body.email }, {}, {}, function (err, user) {
            if (err) {
                res.send(err);
            } else {
                if (user) {
                    res.status(400).send({ message: 'Email Already Subscribed' });
                }
                else {
                    db.InsertDocument('newsletter', { 'email': req.body.email, 'status': "1" }, function (err, result) {
                        if (err) {
                            res.send(err);
                        } else {
                            res.send(result);
                            var mailData = {};
                            mailData.template = 'subscription';
                            mailData.to = req.body.email;
                            mailData.html = [];
                            //mailData.html.push({ name: 'email', value: req.body.email });

                            mailcontent.sendmail(mailData, function (err, response) { });
                        }
                    });
                }
            }
        });
    }




    router.childSuggestions = function (req, res) {


        db.GetAggregation('category', [
            // { $match: { 'status': { $ne: 0 }, 'parent':data, $or: [ { 'name': { $regex: name } }, { 'skills.tags': { $regex: name } } ] } },
            { $match: { 'status': { $ne: 0 }, 'parent': new mongoose.Types.ObjectId(req.body.data) } },
            { $project: { _id: '$_id', name: '$name', slug: '$slug', parent: '$parent', skills: '$skills' } }
        ], function (err, doc) {
            if (err) {
                res.send(err);
            } else {

                res.send(doc);
            }
        });
    }

    router.list = function (req, res) {

        if (req.query.sort != "") {
            var sorted = req.query.sort;
        }
        var bannerQuery = [{
            "$match": { status: 1 }
        }, {
            $project: {
                name: 1,
                image: 1,
                status: 1,
                description: 1,
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

        var condition = { status: 1 };

        if (Object.keys(req.query).length != 0) {
            bannerQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });

            if (req.query.search != '' && req.query.search != 'undefined' && req.query.search) {
                condition['name'] = { $regex: new RegExp('^' + req.query.search, 'i') };
                searchs = req.query.search;
                bannerQuery.push({ "$match": { "documentData.name": { $regex: searchs + '.*', $options: 'si' } } });
            }
            if (req.query.sort !== '' && req.query.sort) {
                sorting = {};
                if (req.query.status == 'false') {
                    sorting["documentData.dname"] = -1;
                    bannerQuery.push({ $sort: sorting });
                } else {
                    sorting["documentData.dname"] = 1;
                    bannerQuery.push({ $sort: sorting });
                }
            }
            if (req.query.limit != 'undefined' && req.query.skip != 'undefined') {
                bannerQuery.push({ '$skip': parseInt(req.query.skip) }, { '$limit': parseInt(req.query.limit) });
            }
            bannerQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
        }


        db.GetAggregation('slider', bannerQuery, function (err, docdata) {

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


    router.getLanguage = function (req, res) {
        db.GetDocument('languages', { 'status': 1 }, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }

     router.getTransalatePage = function (req, res) {
           db.GetDocument('languages', { 'status': 1 }, {}, {}, function (err,languagedata) {
                 if (err) {
                res.send(err);
                } else {
                    for(var i=0;i<languagedata.length;i++){
                         if(languagedata[i].name == req.body.language){
                             var matchlanguage = languagedata[i]._id;
                         }
                     }
                     db.GetDocument('pages', { $and: [ { status: { $ne: 0 } }, { parent: new mongoose.Types.ObjectId(req.body.page) } , { language: new mongoose.Types.ObjectId(matchlanguage) } ] }, {}, {}, function (err, pagedata) {
                        if (err || pagedata.length == 0) {
                                db.GetDocument('pages', { $and: [ { status: { $ne: 0 } }, { _id: new mongoose.Types.ObjectId(req.body.page) } ] }, {}, {}, function (err, pagedata) {
                                            if(err || pagedata.length == 0) {
                                                      res.send(err)
                                            }else{
                                                     res.send(pagedata);
                                            }
                                });
                              } else {
                                     res.send(pagedata);
                        }
                    });
                   
                }
               
            });
         }

    router.getBgimage = function (req, res) {
        db.GetOneDocument('images', { 'imagefor': "backgroundimage" }, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }

    router.gettaskersignupimage = function (req, res) {
        db.GetOneDocument('images', { 'imagefor': "taskersignup" }, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }

    router.getSetting = function (req, res) {
        db.GetDocument('settings', { "alias": "general" }, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata[0].settings);
            }
        });
    }
    router.getwidgets = function (req, res) {
        db.GetDocument('settings', { "alias": "widgets" }, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata[0].settings);
            }
        });
    }

    router.getDefaultLanguage = function (req, res) {
        var query = {};
        if (req.query.name == 'undefined' || req.query.name == '') {
            query = { 'status': 1, default: 1 };
        } else {
            query = { 'status': 1, 'name': req.query.name };
        }
        db.GetDocument('languages', query, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }

    router.getDefaultCurrency = function (req, res) {
        var query = {};
        if (req.query.name == 'undefined' || req.query.name == '') {
            query = { 'status': 1, default: 1 };

        } else {
            query = { 'status': 1, 'name': req.query.name };

        }
        db.GetDocument('currencies', query, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }

    router.getCurrency = function (req, res) {
        db.GetDocument('currencies', { 'status': 1 }, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }

    router.getSocialNetworks = function (req, res) {

        db.GetOneDocument('settings', { alias: 'social_networks' }, {}, {}, function (err, docdata) {
            if (err || !docdata) {
                res.send(err);
            } else {
                res.send(docdata.settings);
            }
        });
    }

    router.getseosetting = function (req, res) {

        db.GetOneDocument('settings', { alias: 'seo' }, {}, {}, function (err, seosettings) {
            if (err || !seosettings) {
                res.send(err);
            } else {
                res.send(seosettings);
            }
        });
    }


    return router;
};
