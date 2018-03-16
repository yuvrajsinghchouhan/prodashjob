var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var FAQ_SCHEMA = {};
FAQ_SCHEMA.FAQ = {
	question: String,
	answer: String,
	status: { type: Number, default: 1 }
};

module.exports = FAQ_SCHEMA;