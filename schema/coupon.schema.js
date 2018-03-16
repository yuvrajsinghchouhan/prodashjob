var COUPON_SCHEMA = {};

COUPON_SCHEMA.COUPON = {
	name: String,
	code: { type: String, unique: true },
	description: String,
	discount_type: String,
	amount_percentage: Number,
	usage: {
		total_coupons: Number,
		per_user: Number,
	},
	valid_from: { type: Date, default: Date.now },
	expiry_date: { type: Date, default: Date.now },
	status: { type: Number, default: 1 }
};
module.exports = COUPON_SCHEMA;