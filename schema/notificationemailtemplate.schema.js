var notification_emailtemplate_schema = {};
notification_emailtemplate_schema.template = {
		name : { type: String, unique: true },
		sender_name : String,
		sender_email : String,
		subject : String,
		content : String,
		notificationtype : String,
		status :{ type:Number, default:1 }
};
module.exports = notification_emailtemplate_schema;
