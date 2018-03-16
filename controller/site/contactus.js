"use strict";
module.exports = function () {
    var mail = require('../../model/mail.js');
    var db = require('../../controller/adaptor/mongodb.js');
    var async = require('async');
    var controller = {};
    var mailcontent = require('../../model/mailcontent.js');


    controller.list = function (req, res) {
        if (req.query.sort != "") {
            var sorted = req.query.sort;
        }
        var bannerQuery = [{
            "$match": { status: { $ne: 0 } }
        }, {
                $project: {
                    name: 1,
                    email: 1,
                    mobile: 1,
                    subject: 1,
                    message: 1,
                    createdon: 1,
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


        db.GetAggregation('contact', bannerQuery, function (err, docdata) {

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

    controller.edit = function (req, res) {

        db.GetDocument('contact', { _id: req.body.id }, {}, {}, function (err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send(data);
            }
        });
    }
    controller.save = function (req, res) {
          var data = {};
          data.name = req.body.username;
          data.email = req.body.email;
          data.mobile = req.body.mobile;
          data.subject = req.body.subject;
          data.message = req.body.message;
          if (req.body._id) {
            db.UpdateDocument('contact', { _id: { $in: req.body._id } }, data, function (err, result) {
                if (err) {
                    res.send(err);
                } else {
                    res.send(result);
                }
            });
          } else {
            data.status = req.body.status;
            db.InsertDocument('contact', data, function (err, result) {
                if (err) {
                    res.send(err);
                } else {
                    res.send(result);
                }
            });
          }
          //		Contact Email template
          async.waterfall([
            function (callback) {
                db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settings) {

                    if (err || !settings) { data.response = 'Configure your website settings'; res.send(data); }
                    else { callback(err, settings.settings); }
                });
            },
            function (settings, callback) {

                db.GetDocument('emailtemplate', { name: { $in: ['contactusmessagetosender', 'Contactusmessagetoadmin'] }, 'status': { $eq: 1 } }, {}, {}, function (err, template) {
                    if (err || !template) { data.response = 'Unable to get email template'; res.send(data); }
                    else { callback(err, settings, template); }
                });
            }
          ], function (err, settings, template) {
            var mailData = {};
    				mailData.template = 'Contactusmessagetoadmin';
            mailData.to = settings.email_address;
    				mailData.html = [];
            mailData.html.push({ name: 'username', value: data.name });
            mailData.html.push({ name: 'message', value: data.message });
            mailData.html.push({ name: 'subject', value: data.subject });
    				mailData.html.push({ name: 'contactemail', value: data.email });
            mailData.html.push({ name: 'senderemail', value: template[1].sender_email });
            mailData.html.push({ name: 'mobile', value: data.mobile});
    				mailData.html.push({ name: 'site_title', value: settings.site_title });
            mailData.html.push({ name: 'logo', value: settings.logo });
            mailData.html.push({ name: 'site_url', value: settings.site_url });
            mailData.html.push({ name: 'privacy', value:settings.site_url + 'pages/privacypolicy' });
    				mailData.html.push({ name: 'terms', value: settings.site_url + '/pages/termsandconditions' });
    				mailcontent.sendmail(mailData, function (err, response) {
    				});
            var mailData1 = {};
            mailData1.template = 'contactusmessagetosender';
            mailData1.to = data.email;
            mailData1.html = [];
            mailData1.html.push({ name: 'username', value: data.name });
            mailData1.html.push({ name: 'message', value: data.message });
            mailData1.html.push({ name: 'subject', value: data.subject });
            mailData1.html.push({ name: 'contactemail', value: data.email });
            mailData1.html.push({ name: 'senderemail', value: template[1].sender_email });
            mailData1.html.push({ name: 'mobile', value: data.mobile});
            mailData1.html.push({ name: 'site_title', value: settings.site_title });
            mailData1.html.push({ name: 'logo', value: settings.logo });
            mailData1.html.push({ name: 'site_url', value: settings.site_url });
            mailData1.html.push({ name: 'privacy', value:settings.site_url + 'pages/privacypolicy' });
            mailData1.html.push({ name: 'terms', value: settings.site_url + '/pages/termsandconditions' });
            mailcontent.sendmail(mailData1, function (err, response) {
            });
            //	End	[Email template]
  })

}

    controller.deletecontact = function (req, res) {
        req.checkBody('delData', 'Invalid contact delData').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }
        db.UpdateDocument('contact', { _id: { $in: req.body.delData } }, { status: 0 }, { multi: true }, function (err, docdata) {
            if (err) {
                res.send(err);
            } else {
                res.send(docdata);
            }
        });
    }
    return controller;
}
