var settings_schema = {};
settings_schema.settings = {
    alias: { type: String, unique: true },
    settings: {}
};

settings_schema.languages = {
    name: String,
    code: { type: String, unique: true },
    translation: Object,
    default: Number,
    status: Number
};

settings_schema.currency = {
    name: String,
    code: { type: String, unique: true },
    symbol: String,
    value: String,
    featured: String,
    default: Number,
    status: Number
};

module.exports = settings_schema;
