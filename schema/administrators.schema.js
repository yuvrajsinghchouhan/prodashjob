var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ADMIN_SCHEMA = {};
ADMIN_SCHEMA.ADMIN = {
    username: { type: String, lowercase: true, index: { unique: true }, trim: true },
    email: { type: String, lowercase: true, index: { unique: true }, trim: true },
    password: String,
    name: String,
    role: String,
	status:Number,
    privileges: [],
    activity: {
        last_login: { type: Date, default: Date.now },
        last_logout: { type: Date, default: Date.now }
    }
};
module.exports = ADMIN_SCHEMA;
