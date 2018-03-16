var mongoose = require("mongoose");
var Schema = mongoose.Schema;


var PAGES_SCHEMA = {};

PAGES_SCHEMA.PAGES = {
	name: String,
	slug: { type: String, unique: true, required: true },
	seo: {
		title: String,
		keyword: String,
		description: String
	},
	description: String,
	css_script: String,
	parent: { type: Schema.ObjectId, ref: 'pages' },
	language: { type: Schema.ObjectId, ref: 'languages' },
	//parent: String,
	status: { type: Number, default: 1 }
};
module.exports = PAGES_SCHEMA;
