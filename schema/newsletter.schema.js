var NEWSLETTER_SCHEMA = {};
NEWSLETTER_SCHEMA.SUBSCRIBER = {
		email: { type : String , unique : true, required : true },
		name:{
        	first_name:String,
        	last_name:String
		},
		status:Number
};
module.exports = NEWSLETTER_SCHEMA;