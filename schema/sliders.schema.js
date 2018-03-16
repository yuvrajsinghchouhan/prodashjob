var SLIDERS_SCHEMA = {};

SLIDERS_SCHEMA.SLIDERS = {
	name: String,
	image: String,
	img_name: String,
    img_path: String,
    description: String,
	status: { type: Number, default: 1 }
};
module.exports = SLIDERS_SCHEMA;