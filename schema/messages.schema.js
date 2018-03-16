var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var MESSAGES = {};
MESSAGES.MESSAGES = {
	user: { type: Schema.ObjectId, ref: 'users' },
	tasker: { type: Schema.ObjectId, ref: 'tasker' },
	task: { type: Schema.ObjectId, ref: 'task' },
	from: { type: Schema.ObjectId },
	user_status: { type: Number, default: 1 },
	tasker_status: { type: Number, default: 1 },
	message: String,
	user_delete_status: { type: Number, default: 1 },
	tasker_delete_status: { type: Number, default: 1 },
	status: { type: Number, default: 1 }
};

module.exports = MESSAGES;