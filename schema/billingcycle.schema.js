var BILLING_SCHEMA = {};

BILLING_SCHEMA.BILLING = {
	billingcycyle: String,
	start_date: { type: Date, default: Date.now },
	end_date: { type: Date, default: Date.now },
	status: { type: Number, default: 1 }
};
module.exports = BILLING_SCHEMA;