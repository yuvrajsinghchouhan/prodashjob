var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var CANCELLATION_REASON_SCHEMA = {};
CANCELLATION_REASON_SCHEMA.CANCELLATION = {
    'reason': String,
    'type': String,
    'status': Number
};

module.exports = CANCELLATION_REASON_SCHEMA;