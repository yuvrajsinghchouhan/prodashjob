var assert = require('chai').assert;
var app = require('../app');
var nodemailer = require('nodemailer');
var db = require('../controller/adaptor/mongodb.js');


describe('mail', function () {
	it('connection', function (done) {

		db.GetOneDocument('settings', { alias: 'smtp' }, {}, {}, function (err, docdata) {
			if (err || !docdata) {
				console.log(err);
			} else {

				var data = {
					from: 'Fred Foo 👥 <foo@blurdybloop.com>',
					to: 'sankar@teamtweaks.com',
					subject: 'Test Mail',
					text: 'Hello',
					html: 'Hello'
				};

				var smtp_host = docdata.settings.smtp_host;
				var smtp_port = docdata.settings.smtp_port;
				var smtp_username = docdata.settings.smtp_username;
				var smtp_password = docdata.settings.smtp_password;

				var transporter = nodemailer.createTransport({
					host: smtp_host,
					port: smtp_port,
					secure: true, // use SSL
					auth: {
						user: smtp_username,
						pass: smtp_password
					},
					tls: {
						rejectUnauthorized: false
					}
				});
				transporter.sendMail(data, function (error, info) {
					console.log(error, info);
					done();
				});
			}
		});
	});
});
