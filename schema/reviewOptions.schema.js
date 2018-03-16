var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var REVIEW_OPTIONS_SCHEMA = {};

REVIEW_OPTIONS_SCHEMA.REVIEW_OPTIONS = {
    rating: Number,
    comments: String,
    user: { type: Schema.Types.ObjectId, ref: 'users' },
    tasker: { type: Schema.Types.ObjectId, ref: 'tasker' },
    task: { type: Schema.Types.ObjectId, ref: 'task' },
    type: String,
    image: String,
    img_name:String,
    img_path:String,
    status: { type: Number, default: 1 }
};
module.exports = REVIEW_OPTIONS_SCHEMA;