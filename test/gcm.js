var assert = require('chai').assert;
var gcm = require('node-gcm');
var CONFIG = require('../config/config');

describe('gcm', function () {
	it('sent push notification to android', function (done) {
		var message = new gcm.Message({
			data: {},
			notification: {
				title: 'Ha ha',
				icon: "ic_launcher",
				body: 'hello'
			}
		});
		var sender = new gcm.Sender('AAAA5EDyc_s:APA91bEFYqoczIy39mVYYF1dMCdbjb3aKFsvKwcp9JbjMkjDnkOMc4uMyetANJr_MF4laCCLTnb_ou4JbhbWu63YsjtjiBPPiy8XRvyo466ca3lYgdFwSxAhTHmzbhshnSFnDAe3xOAX');
		var regTokens = ['APA91bFTdr8PH0jMgBie43fosdaw6aJxTXUrGal4J32UKVv2vleCMvGA99ivEPo4R_h0zRW5YzU-NA110Se0h_afxXBV_xJIhsfS8IAhaXO6bMvvthqNlJA'];
		sender.send(message, {
			registrationTokens: regTokens
		}, function (err, response) {
			console.log(err, response);
			done();
		});
	});
});