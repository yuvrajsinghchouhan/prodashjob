var CONFIG = require('../config/config');
var async = require("async");
var mail = require('../model/mail.js');
var db = require('../controller/adaptor/mongodb.js');

function userRegister(data, callback) {

    async.waterfall([
        function (callback) {
            db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settings) {
                if (err || !settings) { data.response = 'Configure your website settings'; res.send(data); }
                else { callback(err, settings.settings); }
            });
        },
        function (settings, callback) {
            db.GetDocument('emailtemplate', { name: data.template, 'status': { $ne: 0 } }, {}, {}, function (err, template) {

                if (err || !template) { data.response = 'Unable to get email template'; res.send(data); }
                else { callback(err, settings, template); }
            });
        }
    ],
        function (err, settings, template) {
            var html = template[0].email_content;
            html = html.replace(/{{privacy}}/g, settings.site_url + 'page/privacypolicy');
            html = html.replace(/{{terms}}/g, settings.site_url + 'page/termsandconditions');
            html = html.replace(/{{contactus}}/g, settings.site_url + 'contact_us');
            html = html.replace(/{{senderemail}}/g, template[0].sender_email);
            html = html.replace(/{{sendername}}/g, template[0].sender_name);
            html = html.replace(/{{logo}}/g, settings.site_url + settings.logo);
            html = html.replace(/{{site_title}}/g, settings.site_title);
            html = html.replace(/{{email_title}}/g, settings.site_title);
            html = html.replace(/{{email_address}}/g, settings.email_address);

            for (i = 0; i < data.html.length; i++) {
                var regExp = new RegExp('{{' + data.html[i].name + '}}', 'g');
                html = html.replace(regExp, data.html[i].value);
            }

            if (data.to) {
                var tomail = data.to;
            } else {
                var tomail = template[0].sender_email;
            }

            var mailOptions = {
                from: template[0].sender_email,
                to: tomail,
                subject: template[0].email_subject,
                text: html,
                html: html
            };

            mail.send(mailOptions, function (err, response) { callback(err, response); });

        });
}

module.exports = {
    "userRegister": userRegister
};
