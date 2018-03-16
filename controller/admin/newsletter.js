module.exports = function (app, io) {
    var db = require('../../controller/adaptor/mongodb.js');
    var mailcontent = require('../../model/mailcontent.js');
    var async = require('async');
    var mail = require('../../model/mail.js');
    var push = require('../../model/pushNotification.js')(io);

    var controller = {};


    controller.subscriberList = function (req, res) {

        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }

        if (req.body.sort) {
            var sorted = req.body.sort.field;
        }
        var newsQuery = [{
            "$match": { status: { $ne: 0 } }
        }, {
            $project: {
                email: 1,
                createdAt: 1
            }
        },{
            $project: {
                email: 1,
                createdAt: { $toLower: '$' + sorted },
                document: "$$ROOT"
            }
        }, {
            $group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
        }];


        var condition = { status: { $ne: 0 } };
        newsQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });

        if (req.body.search) {
            condition['email'] = { $regex: new RegExp('^' + req.body.search, 'i') };
            var searchs = req.body.search;
            newsQuery.push({ "$match": { "documentData.email": { $regex: searchs + '.*', $options: 'si' } } });
             //search limit
             newsQuery.push({$group: { "_id": null, "countvalue": { "$sum": 1 }, "documentData": { $push: "$documentData" } }});
             newsQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });
              if (req.body.limit && req.body.skip >= 0) {
                newsQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
              }
             newsQuery.push({ $group: { "_id": null, "count": { "$first": "$countvalue" }, "documentData": { $push: "$documentData" } } });
//search limit

        }

        var sorting = {};
        if (req.body.sort) {
            var sorter = 'documentData.' + req.body.sort.field;
            sorting[sorter] = req.body.sort.order;
            newsQuery.push({ $sort: sorting });
        } else {
            sorting["documentData.createdAt"] = -1;
            newsQuery.push({ $sort: sorting });
        }

        if ((req.body.limit && req.body.skip >= 0) && !req.body.search) {
            newsQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
        }
       // newsQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });

  if(!req.body.search){
            newsQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
 }

        db.GetAggregation('newsletter', newsQuery, function (err, docdata) {
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


    controller.subscriberDelete = function (req, res) {
        req.checkBody('delData', 'Invalid delData').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }
        db.UpdateDocument('newsletter', { _id: { $in: req.body.delData } }, { status: 0 }, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }

    controller.sendbulkmail = function (req, res) {
        var sendmail = req.body.delvalue;
        var temid = req.body.template;
        db.GetOneDocument('emailtemplate', { '_id': temid }, {}, {}, function (err, templatedata) {
            if (err) {
                res.send(err);
            } else {
                for (var i = 0; i < sendmail.length; i++) {
                    db.GetOneDocument('newsletter', { '_id': sendmail[i] }, {}, {}, function (err, docdata) {
                        if (err) {
                            res.send(err);
                        } else {
                            var mailData = {};
                            mailData.template = templatedata.name;
                            mailData.to = docdata.email;
                            mailData.html = [];
                            mailData.html.push({ name: 'name', value: 'test' });
                            mailcontent.sendmail(mailData, function (err, response) { });
                        }
                    });
                }
                res.status(200).send({ message: 'success' });
            }
        });
    };

    controller.userList = function (req, res) {

        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }

        if (req.body.sort) {
            var sorted = req.body.sort.field;
        }


        var userQuery = [{
            "$match": { status: { $ne: 0 } }
        }, {
            $project: {
                email: 1,
                dname: { $toLower: '$' + sorted }
            }
        }, {
            $project: {
                email: 1,
                document: "$$ROOT"
            }
        }, {
            $group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
        }];


        var condition = { status: { $ne: 0 } };
        userQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });

        if (req.body.search) {
            condition['email'] = { $regex: new RegExp('^' + req.body.search, 'i') };
            var searchs = req.body.search;
            userQuery.push({ "$match": { "documentData.email": { $regex: searchs + '.*', $options: 'si' } } });
             //search limit
             userQuery.push({$group: { "_id": null, "countvalue": { "$sum": 1 }, "documentData": { $push: "$documentData" } }});
             userQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });
              if (req.body.limit && req.body.skip >= 0) {
                userQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
              }
             userQuery.push({ $group: { "_id": null, "count": { "$first": "$countvalue" }, "documentData": { $push: "$documentData" } } });
//search limit
        }

        var sorting = {};
        if (req.body.sort) {
            var sorter = 'documentData.' + req.body.sort.field;
            sorting[sorter] = req.body.sort.order;
            userQuery.push({ $sort: sorting });
        } else {
            sorting["documentData.createdAt"] = -1;
            userQuery.push({ $sort: sorting });
        }

        if ((req.body.limit && req.body.skip >= 0) && !req.body.search) {
            userQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
        }
        //userQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
          if(!req.body.search){
            userQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
        }

        db.GetAggregation('users', userQuery, function (err, docdata) {
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

    controller.taskerList = function (req, res) {

        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }

        if (req.body.sort) {
            var sorted = req.body.sort.field;
        }


        var taskerQuery = [{
            "$match": { status: { $ne: 0 } }
        }, {
            $project: {
                email: 1,
                dname: { $toLower: '$' + sorted }
            }
        }, {
            $project: {
                email: 1,
                document: "$$ROOT"
            }
        }, {
            $group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
        }];


        var condition = { status: { $ne: 0 } };
        taskerQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });

        if (req.body.search) {
            condition['email'] = { $regex: new RegExp('^' + req.body.search, 'i') };
            var searchs = req.body.search;
            taskerQuery.push({ "$match": { "documentData.email": { $regex: searchs + '.*', $options: 'si' } } });
              //search limit
             taskerQuery.push({$group: { "_id": null, "countvalue": { "$sum": 1 }, "documentData": { $push: "$documentData" } }});
             taskerQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });
              if (req.body.limit && req.body.skip >= 0) {
                taskerQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
              }
             taskerQuery.push({ $group: { "_id": null, "count": { "$first": "$countvalue" }, "documentData": { $push: "$documentData" } } });
//search limit

        }

        var sorting = {};
        if (req.body.sort) {
            var sorter = 'documentData.' + req.body.sort.field;
            sorting[sorter] = req.body.sort.order;
            taskerQuery.push({ $sort: sorting });
        } else {
            sorting["documentData.createdAt"] = -1;
            taskerQuery.push({ $sort: sorting });
        }

        if ((req.body.limit && req.body.skip >= 0) && !req.body.search) {
            taskerQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
        }
        //taskerQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });

        if(!req.body.search){
                  taskerQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
       }

        db.GetAggregation('tasker', taskerQuery, function (err, docdata) {
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

    controller.savemailnotification = function (req, res) {

        if (req.body.notificationtype == 'email') {
            if (req.body._id) {
                db.UpdateDocument('emailnotifications', { _id: req.body._id }, req.body, function (err, docdata) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send(docdata);
                    }
                });
            } else {
                db.InsertDocument('emailnotifications', req.body, function (err, result) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send(result);
                    }
                });
            }
        } else {
            if (req.body._id) {
                db.UpdateDocument('emailnotifications', { _id: req.body._id }, req.body, function (err, docdata) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send(docdata);
                    }
                });
            } else {
                /*var data = {};
                data.name             = req.body.messagetitle;
                data.subject          = req.body.messagesubject;
                data.content          = req.body.messagecontent;
                data.notificationtype = req.body.notificationtype;*/
                db.InsertDocument('emailnotifications', req.body, function (err, result) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send(result);
                    }
                });
            }
        }


    };

    controller.emailtemplatelist = function (req, res) {

        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }

        if (req.body.sort) {
            var sorted = req.body.sort.field;
        }


        var newsQuery = [{
            "$match": { status: { $ne: 0 } }
        }, {
            $project: {
                name: 1,
                notificationtype: 1,
                dname: { $toLower: '$' + sorted }
            }
        }, {
            $project: {
                name: 1,
                notificationtype: 1,
                document: "$$ROOT"
            }
        }, {
            $group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
        }];


        var condition = { status: { $ne: 0 } };
        newsQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });

        if (req.body.search) {
            condition['email'] = { $regex: new RegExp('^' + req.body.search, 'i') };
            var searchs = req.body.search;
            newsQuery.push({
                "$match": {
                    $or: [
                        { "documentData.notificationtype": { $regex: searchs + '.*', $options: 'si' } },
                        { "documentData.name": { $regex: searchs + '.*', $options: 'si' } }
                    ]
                }
            });
             //search limit
             newsQuery.push({$group: { "_id": null, "countvalue": { "$sum": 1 }, "documentData": { $push: "$documentData" } }});
             newsQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });
              if (req.body.limit && req.body.skip >= 0) {
                newsQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
              }
             newsQuery.push({ $group: { "_id": null, "count": { "$first": "$countvalue" }, "documentData": { $push: "$documentData" } } });
//search limit
        }

        var sorting = {};
        if (req.body.sort) {
            var sorter = 'documentData.' + req.body.sort.field;
            sorting[sorter] = req.body.sort.order;
            newsQuery.push({ $sort: sorting });
        } else {
            sorting["documentData.createdAt"] = -1;
            newsQuery.push({ $sort: sorting });
        }

        if ((req.body.limit && req.body.skip >= 0) && !req.body.search) {
            newsQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
        }

       // newsQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
         if(!req.body.search){
            newsQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
        }

        db.GetAggregation('emailnotifications', newsQuery, function (err, docdata) {
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

    controller.edittemplate = function (req, res) {
        db.GetOneDocument('emailnotifications', { _id: req.body.id }, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    };

    controller.savemessagenotification = function (req, res) {
        req.checkBody('name', 'Please enter template name').notEmpty();
        req.checkBody('subject', 'Please enter email subject').notEmpty();
        req.checkBody('content', 'Please enter email content').notEmpty();
        req.body.status = 1;
        req.body.type = "message";
        var errors = req.validationErrors();
        if (errors) {
            res.status(400).send(errors[0].msg);
            return;
        } else {
            if (req.body._id) {
                db.UpdateDocument('emailnotifications', { _id: req.body._id }, req.body, function (err, docdata) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send(docdata);
                    }
                });
            } else {
                db.InsertDocument('emailnotifications', req.body, function (err, result) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send(result);
                    }
                });
            }
        }
    };

    controller.deletenotification = function (req, res) {
        req.checkBody('delData', 'Invalid delData').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }
        db.UpdateDocument('emailnotifications', { _id: { $in: req.body.delData } }, { status: 0 }, { multi: true }, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }


    controller.getmailtemplate = function (req, res) {
        db.GetDocument('emailnotifications', { notificationtype: 'email', status: 1 }, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    };

    controller.getmessagetemplate = function (req, res) {
        db.GetDocument('emailnotifications', { notificationtype: 'message', status: 1 }, {}, {}, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    };


    controller.sendmessagemail = function (req, res) {
        var sendmail = req.body.delvalue;
        var temid = req.body.template;
        var type = req.body.type;

        var query = {};
        if (type == 'user') {
            db.GetOneDocument('emailnotifications', { '_id': temid }, {}, {}, function (err, templatedata) {
                if (err) {
                    res.send(err);
                } else {
                    for (var i = 0; i < sendmail.length; i++) {
                        db.GetOneDocument('users', { '_id': sendmail[i] }, {}, {}, function (err, docdata) {
                            if (err) {
                                res.send(err);
                            } else {
                                async.waterfall([
                                    function (callback) {
                                        db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settings) {
                                            if (err || !settings) { data.response = 'Configure your website settings'; res.send(data); }
                                            else { callback(err, settings.settings); }
                                        });
                                    },
                                    function (settings, callback) {
                                        db.GetDocument('emailnotifications', { name: { $in: [templatedata.name] }, 'status': { $ne: 0 } }, {}, {}, function (err, template) {
                                            if (err || !template) { data.response = 'Unable to get email template'; res.send(data); }
                                            else { callback(err, settings, template); }
                                        });
                                    }
                                ], function (err, settings, template) {
                                    var html = template[0].content;
                                    html = html.replace(/{{privacy}}/g, settings.site_url + 'pages/privacypolicy');
                                    html = html.replace(/{{terms}}/g, settings.site_url + 'pages/termsandconditions');
                                    var mailOptions = {
                                        from: template[0].sender_email,
                                        to: docdata.email,
                                        subject: template[0].subject,
                                        text: html,
                                        html: html
                                    };
                                    mail.send(mailOptions, function (err, response) { });
                                });
                            }
                        });
                    }
                    res.status(200).send({ message: 'success' });
                }
            });
        } else {
            db.GetOneDocument('emailnotifications', { '_id': temid }, {}, {}, function (err, templatedata) {
                if (err) {
                    res.send(err);
                } else {
                    for (var i = 0; i < sendmail.length; i++) {
                        db.GetOneDocument('tasker', { '_id': sendmail[i] }, {}, {}, function (err, docdata) {
                            if (err) {
                                res.send(err);
                            } else {
                                async.waterfall([
                                    function (callback) {
                                        db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settings) {
                                            if (err || !settings) { data.response = 'Configure your website settings'; res.send(data); }
                                            else { callback(err, settings.settings); }
                                        });
                                    },
                                    function (settings, callback) {
                                        db.GetDocument('emailnotifications', { name: { $in: [templatedata.name] }, 'status': { $ne: 0 } }, {}, {}, function (err, template) {
                                            if (err || !template) { data.response = 'Unable to get email template'; res.send(data); }
                                            else { callback(err, settings, template); }
                                        });
                                    }
                                ], function (err, settings, template) {
                                    var html = template[0].content;
                                    html = html.replace(/{{privacy}}/g, settings.site_url + 'pages/privacypolicy');
                                    html = html.replace(/{{terms}}/g, settings.site_url + 'pages/termsandconditions');
                                    var mailOptions = {
                                    from: template[0].sender_email,
                                    to: docdata.email,
                                    subject: template[0].subject,
                                    text: html,
                                    html: html
                                    };
                                    mail.send(mailOptions, function (err, response) { });
                                });
                            }
                        });
                    }
                    res.status(200).send({ message: 'success' });
                }
            });
        }
    };

    controller.sendmessage = function (req, res) {
        var sendmail = req.body.delvalue;
        var temid = req.body.template;
        if (req.body.type == 'user') {
            db.GetOneDocument('emailnotifications', { '_id': temid }, {}, {}, function (err, templatedata) {
                if (err) {
                    res.send(err);
                } else {
                    for (var i = 0; i < sendmail.length; i++) {
                        db.GetOneDocument('users', { '_id': sendmail[i] }, {}, {}, function (err, docdata) {
                            if (err) {
                                res.send(err);
                            } else {
                                var android_provider = docdata._id;
                                var message = templatedata.content;
                                var response_time = 250;
                                var options = { 'subject': templatedata.subject, 'user_id': android_provider, };
                                push.sendPushnotification(android_provider, message, 'admin_notification', 'ANDROID', options, 'USER', function (err, response, body) { });
                            }
                        });
                    }
                    res.status(200).send({ message: 'success' });
                }
            });
        } else {
            db.GetOneDocument('emailnotifications', { '_id': temid }, {}, {}, function (err, templatedata) {
                if (err) {
                    res.send(err);
                } else {
                    for (var i = 0; i < sendmail.length; i++) {
                        db.GetOneDocument('tasker', { '_id': sendmail[i] }, {}, {}, function (err, docdata) {
						console.log("docdata",docdata)

                            if (err) {
                                res.send(err);
                            } else {
                                var android_provider = docdata._id;
                                var message = templatedata.content;
                                var response_time = 250;
                                var options = { 'subject': templatedata.subject, 'user_id': android_provider };
                                push.sendPushnotification(android_provider, message, 'admin_notification', 'ANDROID', options, 'PROVIDER', function (err, response, body) {
								console.log("err",err)
								console.log("response",response)
								console.log("body",body)


								});
                            }
                        });
                    }
                    res.status(200).send({ message: 'success' });
                }
            });
        }



    };

    return controller;
    /*module.exports = router;*/

}
