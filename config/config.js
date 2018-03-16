var path = require('path');
var fs = require('fs');

var config = JSON.parse(fs.readFileSync(path.join(__dirname, "/config.json"), 'utf8'));

var CONFIG = {};

CONFIG.ENV = (process.env.NODE_ENV || 'development');
CONFIG.PORT = (process.env.VCAP_APP_PORT || config.port);
CONFIG.DB_URL = 'mongodb://' + config.mongodb.host + ':' + config.mongodb.port + ':' + config.mongodb.username + ':' + config.mongodb.password + ':' + config.mongodb.url + '/' + config.mongodb.database;
CONFIG.MOBILE_API = true; // true & false

CONFIG.DIRECTORY_USERS = './uploads/images/users/';
CONFIG.DIRECTORY_TASKERS = './uploads/images/tasker/';
CONFIG.DIRECTORY_CATEGORIES = './uploads/images/categories/';
CONFIG.DIRECTORY_SLIDERS = './uploads/images/sliders/';
CONFIG.DIRECTORY_OTHERS = './uploads/images/others/';

CONFIG.USER_PROFILE_IMAGE_DEFAULT = 'uploads/default/user.jpg';
CONFIG.USER_PROFILE_IMAGE = 'uploads/images/users/';
CONFIG.CATEGORY_DEFAULT_IMAGE = 'uploads/default/category.jpg';
CONFIG.MARKER_DEFAULT_IMAGE = 'uploads/default/marker.jpg';

CONFIG.SECRET_KEY = 'c8b3a5ee-f779-49e6-9192-584ed602b41a';

CONFIG.GCM_KEY = '';
CONFIG.GOOGLE_MAP_API_KEY = 'AIzaSyBdQiMiJA7oYVNgV9XIor4s9VUDi9keEAo';

// Notifications
CONFIG.NOTIFICATION = {};
CONFIG.NOTIFICATION.REQUEST_FOR_A_JOB = 'Request for a job';
CONFIG.NOTIFICATION.YOUR_JOB_IS_ACCEPTED = 'Your job is accepted';
CONFIG.NOTIFICATION.PROVIDER_START_OFF_YOUR_JOB = 'Provider start off your job';
CONFIG.NOTIFICATION.BILLING_AMOUNT_PARTIALLY_PAID = 'Billing amount Partially Paid';
CONFIG.NOTIFICATION.PROVIDER_ARRIVED_ON_YOUR_PLACE = 'Provider arrived on your place';
CONFIG.NOTIFICATION.PROVIDER_START_OFF_FROM_HIS_LOCATION = 'Provider start off from his location';
CONFIG.NOTIFICATION.PROVIDER_ARRIVED_ON_JOB_LOCATION = 'Provider arrived on job location';
CONFIG.NOTIFICATION.PROVIDER_STARTED_YOUR_JOB = 'Provider started your job';
CONFIG.NOTIFICATION.PAYMENT_COMPLETED = 'Payment Completed';
CONFIG.NOTIFICATION.YOUR_JOB_IS_REJECTED = 'Your job is Rejected';
CONFIG.NOTIFICATION.YOUR_JOB_HAS_BEEN_COMPLETED = 'Your job has been completed';
CONFIG.NOTIFICATION.JOB_REJECTED_BY_USER = 'Job Rejected by User';
CONFIG.NOTIFICATION.PROVIDER_CANCELLED_THIS_JOB = 'Provider rejected this job';
CONFIG.NOTIFICATION.YOUR_PROVIDER_IS_ON_THEIR_WAY = 'Your provider is on their way';
CONFIG.NOTIFICATION.PROVIDER_WANTS_PAYMENT_FOR_HIS_JOB = 'Provider request payment for his job';
CONFIG.NOTIFICATION.YOUR_BILLING_AMOUNT_PAID_SUCCESSFULLY = 'Your billing amount paid successfully';
CONFIG.NOTIFICATION.YOU_GOT_A_REQUEST_FOR_A_NEW_JOB = 'You got a request for a new job';
CONFIG.NOTIFICATION.USER_CANCELLED_THIS_JOB = 'User Cancelled this job';
CONFIG.NOTIFICATION.PROVIDER_ARRIVED_AT_JOB_LOCATION = 'Provider arrived at job location';
CONFIG.NOTIFICATION.PROVIDER_SENT_REQUEST_FOR_PAYMENT = 'Provider have requested for payment';
CONFIG.NOTIFICATION.JOB_HAS_BEEN_STARTED = 'Job has been started';
CONFIG.NOTIFICATION.JOB_HAS_BEEN_COMPLETED = 'Job has been completed';
CONFIG.NOTIFICATION.JOB_HAS_BEEN_CLOSED = 'Payment has been completed';
CONFIG.NOTIFICATION.PAYMENT_MADE_THROUGH_WALLET = 'Payment made through wallet';
CONFIG.NOTIFICATION.JOB_HAS_BEEN_CANCELLED = 'Job has been cancelled';
CONFIG.NOTIFICATION.JOB_BOOKED = 'Job booked';
CONFIG.NOTIFICATION.HIRED_JOB = 'Hired job';
// Notifications Ends

CONFIG.APNS = {};
CONFIG.APNS.MODE = true; // Production = true or Development = false
CONFIG.APNS.BUNDLE_ID_USER = 'com.casperon.quickrabitUser';
CONFIG.APNS.BUNDLE_ID_TASKER = 'com.casperon.quickrabbitpartner';
CONFIG.APNS.CERT_TASKER = path.join(__dirname, "/apns/dev/handypartnerdist.pem");
CONFIG.APNS.CERT_USER = path.join(__dirname, "/apns/dev/handyuserDist.pem");
CONFIG.APNS.KEY = path.join(__dirname, "/apns/dev/handyuserdistkey.pem");

CONFIG.SOCIAL_NETWORKS = {
    'facebookAuth': {
        'clientID': '1589589941346013',
        'clientSecret': 'ed67fd31ae628fde866bae1b6f71604e',
        'callbackURL': 'http://maidac.casperon.co/auth/facebook/callback'
      
    },
};

//Export Module
module.exports = CONFIG;
