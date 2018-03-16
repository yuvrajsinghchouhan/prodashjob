var assert = require('chai').assert;
var app = require('../app');
var nodemailer = require('nodemailer');
var db = require('../controller/adaptor/mongodb.js');


describe('sms', function () {
	it('send', function (done) {
	
	this.timeout(5000);

		db.GetOneDocument('settings', { alias: 'sms' }, {}, {}, function (err, document) {
			if (err) {
				callback(err, document);
			} else {
				var twilio = document.settings.twilio;
				var client = require('twilio')('ACc220a676ed855e21cf67ef13f5cd1aee', '8e40ebbb572cc9592727e427b1e84af9');
				//if (!from) { from = '+18552513612' }
				client.messages.create({
					to: '+919940963235',
					from: '+18552513612',
					body: 'Hello'
				}, function (err, message) {
					callback(err, message);
				});
			}
		});
	});
});
