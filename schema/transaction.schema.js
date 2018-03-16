var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var TRANSACTION_SCHEMA = {};
TRANSACTION_SCHEMA.TRANSACTION = {
	user: { type: Schema.Types.ObjectId, ref: 'users' },
	tasker: { type: Schema.Types.ObjectId, ref: 'tasker' },
	task: { type: Schema.Types.ObjectId, ref: 'task' },
	task_date: Date,
	type: String,
	amount: Number,
	status: { type: Number, default: 1 },
    transactions: []
};
module.exports = TRANSACTION_SCHEMA;


/** Status
 * 1 - Completed
 * 2 - Pending
 * 3 - InComplete
 * 
 *  */