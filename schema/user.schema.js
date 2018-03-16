var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var USERS_SCHEMA = {};
USERS_SCHEMA.USER = {
    username: { type: String, lowercase: true, index: { unique: true }, trim: true },
    email: { type: String, lowercase: true, index: { unique: true }, trim: true },
    password: String,
    media_id: String,
    gcm_id: Number,
    phone: {
        code: String,
        number: String
    },
    otp: String,
    gender: String,
    about: String,
    name: {
        first_name: String,
        last_name: String
    },
    address: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        zipcode: String,
        country: String,
        mobile: Number,
        street: String,
        landmark: String,
        locality: String
    },
    addressList: [{
        line1: String,
        line2: String,
        city: String,
        state: String,
        zipcode: String,
        mobile: Number,
        country: String,
        location: {
            lat: Number,
            lng: Number
        },
        street: String,
        landmark: String,
        locality: String,
        status: { type: Number, default: 1 }
    }],
    role: String,
    activity: {
        last_login: { type: Date, default: Date.now },
        last_logout: { type: Date, default: Date.now }
    },
    referal_code: String,
    refer_history: [{
        reference_id: String,
        reference_mail: String,
        amount_earns: Number,
        reference_date: Date,
        used: String
    }],
    unique_code: { type: String, index: { unique: true }, trim: true },
    verification_code: [],
    avatar: String,
    img_name: String,
    img_path: String,
    status: { type: Number, default: 1 },
    //privileges: [],
    wallet_id: { type: Schema.ObjectId },
    location_id: { type: Schema.ObjectId },
    provider_notification: { type: Schema.ObjectId, ref: 'tasker' },
    billing_address: {
        name: String,
        line1: String,
        line2: String,
        city: String,
        state: String,
        zipcode: String,
        country: String,
        phone: String
    },
    location: {
        lng: Number,
        lat: Number
    },
    socialnetwork: {
        facebook_link: String,
        twitter_link: String,
        googleplus_link: String
    },
    type: String,
    facebook: {
        id: String,
        token: String,
        name: String,
        profile: String,
        email: String
    },
    twitter: {
        id: String,
        token: String,
        name: String,
        displayName: String
    },
    geo: [],
    google: {
        id: String,
        token: String,
        name: String,
        email: String
    },
    /*
    seller: {
        payment_comission: Number
    },
    following_count: Number,
    follower_count: Number,
    */
    birthdate: {
        year: Number,
        month: Number,
        date: Number
    },
    //stripe_connect: Object,
    /*
    stripe: {
        customer: String
    },
    */
    reset_code: String,
    emergency_contact: {
        name: String,
        email: String,
        phone: {
            code: String,
            number: Number
        },
        otp: String,
        verification: {
            email: Number,
            phone: Number
        }
    },
    mode: String,
    availability: Number,
    bio: String,
    banking: {
        acc_holder_name: String,
        acc_holder_address: String,
        acc_number: String,
        bank_name: String,
        branch_name: String,
        branch_address: String,
        swift_code: String,
        routing_number: String
    },
    cancellation_reason: String,
    device_info: {
        device_type: String, //ios/android
        device_token: String,
        gcm: String,
        android_notification_mode: String, //socket/gcm
        ios_notification_mode: String, //socket/apns
        //notification_mode: String //socket/apns/gcm
    }
};
module.exports = USERS_SCHEMA;
