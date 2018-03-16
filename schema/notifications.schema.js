var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var NOTIFICATIONS = {};
NOTIFICATIONS.NOTIFICATIONS = {
	user: { type: Schema.ObjectId, ref: 'users' },
	tasker: { type: Schema.ObjectId, ref: 'tasker' },
	type: String,
	message: String,
	raw_data: {},
	status: { type: Number, default: 1 }
};

module.exports = NOTIFICATIONS;