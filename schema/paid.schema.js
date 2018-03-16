var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var PAID_SCHEMA = {};
PAID_SCHEMA.PAID = {
    tasker: { type: Schema.Types.ObjectId, ref: 'tasker' },
    billing_cycle: { type: Schema.Types.ObjectId, ref: 'billing' },
    invoice: {},
    task_count: Number,
    task: [],
    payment: {},
    //total_amount: String,
    //admin_commission: String,
    //tasker_earning: String
};

module.exports = PAID_SCHEMA;
