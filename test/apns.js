var assert = require('chai').assert;
var apn = require('apn');
var CONFIG = require('../config/config');

describe('APNS', function () {

	it('sent push notification to ios', function (done) {
		var options = { cert: CONFIG.APNS.CERT_USER, key: CONFIG.APNS.KEY, production: CONFIG.APNS.MODE };
		var topic = CONFIG.APNS.BUNDLE_ID_USER;

		var apnProvider = new apn.Provider(options);
		var deviceToken = '1569a3d10e0c075080287b9944a8c05c43d3d329828f1fa75e82310e7b56795a';
		var note = new apn.Notification();
		note.expiry = 3600;
		note.sound = 'ping.aiff';
		note.alert = 'Hello';
		note.payload = { 'messageFrom': 'Node.JS Team' };
		note.topic = topic;
		apnProvider.send(note, deviceToken).then((result) => {
			console.log(result.failed);
			done();
		});

	});

});