"use strict";

/** Dependency Injection */
var express = require('express') // $ npm install express
    , path = require('path') // Node In-Build Module
    , bodyParser = require('body-parser') // $ npm install body-parser
    , session = require('express-session') // $ npm install express-session
    , cookieParser = require('cookie-parser') // $ npm install cookie-parser
    , passport = require('passport') // $ npm install passport
    , flash = require('connect-flash') // $ npm install connect-flash
    , mongoose = require('mongoose') // $ npm install mongoose
    , bcrypt = require('bcrypt-nodejs')// $ npm install bcrypt-nodejs
    , fs = require('fs')
    , spawn = require('child_process').spawn;

var app = express(); // Initializing ExpressJS

/** Socket.IO */
var server = require('http').createServer(app);
/** /Socket.IO */

/** Middleware Configuration */
app.disable('x-powered-by');
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true })); // Parse application/x-www-form-urlencoded
app.use(bodyParser.json({ limit: '100mb' })); // bodyParser - Initializing/Configuration
app.use(cookieParser('CasperonQuickRabbit')); // cookieParser - Initializing/Configuration cookie: {maxAge: 8000},
app.use(session({ secret: 'CasperonQuickRabbit', resave: true, saveUninitialized: true })); // express-session - Initializing/Configuration
app.use('/app', express.static(path.join(__dirname, '/app'), { maxAge: 100 * 10000 })); // Serving Static Files For AngularJS
app.use('/uploads', express.static(path.join(__dirname, '/uploads'), { maxAge: 100 * 10000 })); // Serving Static Files For client
app.set('view engine', 'pug');
app.set('views', './views');
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
/** /Middleware Configuration */

app.get('/', function (req, res) {
    res.render('installation/setup', { title: 'Hey', message: '../uploads/mobile/images/failed.png' });
});

app.post('/configure', function (req, res) {
    fs.access(path.join(__dirname, '/config/setup.json'), (err) => {
        if (err) {
            console.log(err);
            var webdata = {};
            webdata.title = 'Sorry !!';
            webdata.message = 'Website Installation Already';
            res.render('installation/page', webdata);
        } else {
            var request = {};
            request.dbhost = req.body.host_name;
            request.dbport = req.body.port_number;
            request.dbname = req.body.db_name;
            request.port = req.body.site_port;
            request.siteurl = req.body.site_url;
            request.sitename = req.body.site_name;
            request.admin_name = req.body.admin_name;
            request.email = req.body.admin_email;
            request.admin_password = req.body.admin_password;
            request.confirmPassword = req.body.confirmPassword;

            var args = ['--host', request.dbhost, '--port', request.dbport, '--db', request.dbname, '--drop', 'db'];
            var ls = spawn('mongorestore', args);
            ls.on('close', (code) => {
                fs.readFile(path.join(__dirname, '/config/setup.json'), "utf8", function (error, data) {
                    var config = JSON.parse(data)
                    config.port = request.port;
                    config.mongodb.host = request.dbhost;
                    config.mongodb.port = request.dbport;
                    config.mongodb.database = request.dbname;
                    fs.writeFile(path.join(__dirname, '/config/config.json'), JSON.stringify(config, null, 4), function (err, respo) {
                        if (err) {
                            res.send(err);
                        } else {
                            var data = {};
                            data = { settings: {} };
                            var CONFIG = require('./config/config');
                            mongoose.connect(CONFIG.DB_URL, function (error) {
                                if (error) {
                                    console.log('MongoDB connection error: ', error);
                                }
                            }); //Connecting with MongoDB

                            var db = require('./controller/adaptor/mongodb.js');
                            if (request.admin_password) {
                                request.admin_password = bcrypt.hashSync(request.admin_password, bcrypt.genSaltSync(8), null);
                            }
                            db.InsertDocument('admins', { "username": request.admin_name, "name": request.admin_name, "email": request.email, "role": 'admin', "password": request.admin_password, "status": 1 }, function (err, result) {
                                if (err) {
                                    res.send(err);
                                } else {
                                    db.UpdateDocument('settings', { alias: 'general' }, { $set: { "settings.site_title": request.sitename, "settings.site_url": request.siteurl } }, { multi: false }, function (err, result) {
                                        if (err) {
                                            var webdata = {};
                                            webdata.title = 'Sorry !!';
                                            webdata.message = 'Website Installation Already';
                                            res.render('installation/page', webdata);
                                        } else {
                                            var webdata = {};
                                            webdata.title = 'Thank You !!';
                                            webdata.message = 'Website Installation Completed ';
                                            res.render('installation/page', webdata);
                                        }
                                    });
                                }
                            });
                        }
                    });
                });

            });
        }
    });
});

app.get('/test', function (req, res) {
    var data = {};
    data.title = 'Thank You !!';
    data.message = 'Website Installation Completed ';
    res.render('installation/page', data);
});

/** HTTP Server Instance */
try {
    server.listen(3001, function () {
        console.log('Server turned on with mode on port ', 3001);
    });
} catch (ex) {
    console.log(ex);
}
/** /HTTP Server Instance */