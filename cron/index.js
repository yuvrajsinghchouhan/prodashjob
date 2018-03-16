var moment = require('moment');
var db = require('../controller/adaptor/mongodb.js');
var CronJob = require('cron').CronJob;

var job = new CronJob({
    cronTime: '0 0 * * *', //Daily Cron Check @ 00:00
    onTick: function () {
        db.GetOneDocument('settings', { "alias": 'general' }, {}, {}, function (err, settings) {
          
            if (err) {
                //res.send(err);
            } else {
                var billingcycle = parseInt(settings.settings.billingcycle);
                var ext = {};
                ext.sort = { createdAt: -1 };
                db.GetOneDocument('billing', {}, {}, ext, function (err, billingcycyle) {
                    if (err) {
                    } else {
                        if (!billingcycyle) {
                            var ext = {};
                            ext.sort = { createdAt: -1 };
                            db.GetOneDocument('task', { 'status': 7 }, {}, ext, function (err, docdata) {
                                if (err) {
                                } else {
                                    if (docdata) {
                                        var date = docdata.createdAt;
                                        var startDate = moment(date).format("YYYY/MM/DD 00:00:00.000");
                                        var endDate = moment().format("YYYY/MM/DD 00:00:00.000");
                                        var diffDays = moment(new Date(endDate)).diff(moment(new Date(startDate)), 'days');
                                        if (diffDays >= billingcycle) {
                                            var data = {};
                                            data.start_date = moment(new Date(startDate));
                                            data.end_date = moment(new Date(endDate));
                                            data.billingcycyle = data.start_date.format("YYYY/MM/DD") + '-' + data.end_date.format("YYYY/MM/DD");
                                            db.InsertDocument('billing', data, function (err, result) { });
                                        }
                                    }
                                }
                            });
                        } else {
                            var date = billingcycyle.end_date;
                            var startDate = moment(date).format("YYYY/MM/DD 00:00:00.000");
                            var endDate = moment(date).add(billingcycle, 'day').format("YYYY/MM/DD 00:00:00.000");
                            var currentDate = moment().format("YYYY/MM/DD 00:00:00.000");
                            var endDateUnix = moment(new Date(endDate)).unix();
                            var currentDateUnix = moment(new Date(currentDate)).unix();
                            if (endDateUnix <= currentDateUnix) {
                                var data = {};
                                data.start_date = moment(new Date(startDate));
                                data.end_date = moment(new Date(endDate));
                                data.billingcycyle = data.start_date.format("YYYY/MM/DD") + '-' + data.end_date.format("YYYY/MM/DD");
                                db.GetOneDocument('billing', { 'billingcycyle': data.billingcycyle }, {}, {}, function (err, billingcycyle) {
                                    if (err) {
                                    } else {
                                        if (!billingcycyle) {
                                            db.InsertDocument('billing', data, function (err, result) { });
                                        }
                                    }
                                });
                            }
                        }
                    }
                });
            }
        });
    },
    start: false,
    //timeZone: 'America/Los_Angeles'
});
job.start();
