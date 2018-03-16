var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var WALLET_SCHEMA = {};
WALLET_SCHEMA.WALLET = {
    user_id: { type: Schema.ObjectId, ref: 'users' },
    total: Number,
    transactions: []
};
module.exports = WALLET_SCHEMA;


/*
 transactions: [{
        trans_type: String,
        debit_type: String,
        ref_id: String,
        trans_amount: Number,
        avail_amount: Number,
        trans_date: { type: Date }
    }]
*/