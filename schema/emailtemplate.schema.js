var email_template_schema = {};
email_template_schema.template = {
		name : { type: String, unique: true },
		email_subject : String,
		sender_name : String,
		sender_email : String,
		email_content : String,
		status :{ type:Number, default:1 },
		subscription:{ type:Number, default:0 }
};
module.exports = email_template_schema;
