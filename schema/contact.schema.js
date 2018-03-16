var CONTACT_SCHEMA={};

CONTACT_SCHEMA.CONTACT ={
	name:String,
	email:String,
	mobile:String,
	subject:String,
	message:String,
	status: { type: Number, default: 1 }	
};
module.exports = CONTACT_SCHEMA;
