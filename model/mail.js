"use strict"

var nodemailer = require('nodemailer');
var db = require('../controller/adaptor/mongodb.js');

function send(data, callback) {
    db.GetOneDocument('settings', { 'alias': 'smtp' }, {}, {}, function (err, settings) {
        if (err || !settings) {
            data.response = 'Error in settings'; res.send(data);
        } else {
            var smtp_host = settings.settings.smtp_host;
            var smtp_port = settings.settings.smtp_port;
            var smtp_username = settings.settings.smtp_username;
            var smtp_password = settings.settings.smtp_password;

            var transporter = nodemailer.createTransport({
                host: smtp_host,
                port: smtp_port,
                secure: true,
                auth: {
                    user: smtp_username,
                    pass: smtp_password
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
            transporter.sendMail(data, function (error, info) {
                callback(error, info);
            });
        }
    });
}

module.exports = {
    "send": send
};
