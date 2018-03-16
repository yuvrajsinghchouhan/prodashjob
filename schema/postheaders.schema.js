var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var POSTHEADER_SCHEMA = {};

POSTHEADER_SCHEMA.POSTHEADER = {
	title: String,
	image: String,
	img_name: String,
	img_path: String,
	description: String,
	status: { type: Number, default: 1 }
};

module.exports = POSTHEADER_SCHEMA;
