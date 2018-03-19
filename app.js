"use strict";

/** Dependency Injection */
var  application_root = __dirname
    ,express = require('express') // $ npm install express
    , path = require('path') // Node In-Build Module
    , bodyParser = require('body-parser') // $ npm install body-parser
    , session = require('express-session') // $ npm install express-session
    , cookieParser = require('cookie-parser') // $ npm install cookie-parser
    , passport = require('passport') // $ npm install passport
    , flash = require('connect-flash') // $ npm install connect-flash
    , mongoose = require('mongoose') // $ npm install mongoose
    , validator = require('express-validator') // $ npm install express-validator
    , CONFIG = require('./config/config') // Injecting Our Configuration
    , favicon = require('serve-favicon') // $ npm install serve-favicon
    , compression = require('compression')
    , url = require('url');
/** /Dependency Injection */

/** Socket.IO */
var app = express(); // Initializing ExpressJS
var server = require('http').createServer(app);
var io = require('socket.io')(server);
/** /Socket.IO */

/** Middleware Configuration */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
app.disable('x-powered-by');
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true })); // Parse application/x-www-form-urlencoded
app.use(bodyParser.json({ limit: '100mb' })); // bodyParser - Initializing/Configuration
app.use(cookieParser('CasperonQuickRabbit')); // cookieParser - Initializing/Configuration cookie: {maxAge: 8000},
app.use(session({ secret: 'CasperonQuickRabbit', resave: true, saveUninitialized: true })); // express-session - Initializing/Configuration
app.use(validator());
app.use(passport.initialize()); // passport - Initializing
app.use(passport.session()); // passport - User Session Initializing
app.use(flash()); // flash - Initializing
app.use(compression()); //use compression middleware to compress and serve the static content.
app.use('/app', express.static(path.join(__dirname, '/app'), { maxAge: 7 * 86400000 })); // 1 day = 86400000 ms
app.use('/uploads', express.static(path.join(__dirname, '/uploads'), { maxAge: 7 * 86400000 }));
app.set('view engine', 'pug');
app.locals.pretty = false;
app.set('views', '/views');
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
/** /Middleware Configuration */

/*
mongoose.connect(CONFIG.DB_URL, function (error) {
    if (error) {
        console.log('MongoDB connection error: ', error);
    }
}); //Connecting with MongoDB
*/

/** MongoDB Connection */
mongoose.connect(CONFIG.DB_URL);
mongoose.connection.on('error', function (error) {
    console.error('Error in MongoDb connection: ' + error);
});
mongoose.connection.on('connected', function () {
    console.log('MongoDB connected!');
});
mongoose.connection.on('reconnected', function () {
    console.log('MongoDB reconnected!');
});
mongoose.connection.on('disconnected', function () {
    console.log('MongoDB disconnected!');
});

/** Dependency Mapping */
require('./routes')(app, passport, io);
require('./sockets')(io);
require('./cron');
/** /Dependency Mapping*/

//Start server
var port = 8080;

/** HTTP Server Instance */
try {
    server.listen(CONFIG.PORT, function () {
        console.log('Server turned on with', CONFIG.ENV, 'mode on port', CONFIG.PORT);
    });
} catch (ex) {
    console.log(ex);
}
/** /HTTP Server Instance */
