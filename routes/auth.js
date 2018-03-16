var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var CONFIG = require('../config/config'); //configuration variables
var User = require('../model/mongodb.js').users;
var Tasker = require('../model/mongodb.js').tasker;
var jwt = require('jsonwebtoken');
var async = require("async");
var mailcontent = require('../model/mailcontent.js');
var bcrypt = require('bcrypt-nodejs');
//var flash = require('connect-flash');
var twilio = require('../model/twilio.js');
var db = require('../controller/adaptor/mongodb.js');
var mongoose = require("mongoose");
var library = require('../model/library.js');
var otp = require('otplib/lib/authenticator');

var secret = otp.utils.generateSecret();

function jwtSign(payload) {
    var token = jwt.sign(payload, CONFIG.SECRET_KEY);
    return token;
}

module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        done(null, { id: user.id });
    });

    passport.use('site-register', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'pwd',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
        function (req, email, pwd, done) {
            process.nextTick(function () {
                db.GetOneDocument('users', { 'username': req.body.username, 'email': email }, {}, {}, function (err, user) {
                    if (err) {
                        return done(err);
                    } else {
                        if (user) {
                            return done('Email Id Or User name already exists', false, null);
                        } else {
                            var authHeader = jwtSign({ username: req.body.username });
                            var newUser = {};
                            newUser.unique_code = library.randomString(8, '#A');
                            newUser.username = req.body.username;
                            newUser.email = req.body.email;
                            newUser.password = bcrypt.hashSync(req.body.pwd, bcrypt.genSaltSync(8), null);
                            //newUser.password = newUser.generateHash(req.body.pwd);
                            newUser.role = req.body.role;
                            newUser.status = 1;
                            newUser.address = req.body.address;
                            // newUser.location = req.body.location;
                            newUser.phone = req.body.phone;
                            db.GetOneDocument('settings', { 'alias': 'sms'  }, {}, {}, function (err, smsdocdata) {
                                if (err || !smsdocdata) {
                                    res.send(err);
                                } else {
                                  if(smsdocdata.settings.twilio.mode == 'development'){
                                      newUser.verification_code = [{ "mobile": otp.generate(secret) }];
                                  }
                                // }
                                // });
                            newUser.name = { 'first_name': req.body.firstname, 'last_name': req.body.lastname };
                            newUser.activity = { 'created': req.body.today, 'modified': req.body.today, 'last_login': req.body.today, 'last_logout': req.body.today };
                            db.InsertDocument('users', newUser, function (err, user) {
                                if (err) {
                                    return done(null, false, req.flash('Error', 'That email or username is already taken.'));
                                }
                                else {
                                  if(smsdocdata.settings.twilio.mode == 'development'){
                                    var to = user.phone.code + user.phone.number;
                                    var message = 'Thank you for using Handyforall! Your OTP is: ' + newUser.verification_code[0].mobile;
                                    twilio.createMessage(to, '', message, function (err, response) { });
                                  }
                                    db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settingdata) {
                                        if (err || !settingdata) {
                                            res.send(err);
                                        } else {
                                            var testingStatus = settingdata.settings.referral.status;

                                            req.session.passport.header = authHeader;
                                            if (settingdata.settings.referral.status != 0) {
                                                var mailData = {};
                                                mailData.template = 'Sighnupmessage';
                                                mailData.to = user.email;
                                                mailData.html = [];
                                                mailData.html.push({ name: 'testingStatus', value: settingdata.settings.referral.status });
                                                mailData.html.push({ name: 'name', value: user.name.first_name });
                                                mailData.html.push({ name: 'email', value: user.email });
                                                mailData.html.push({ name: 'referal_code', value: user.unique_code });
                                                mailData.html.push({ name: 'site_url', value: settingdata.settings.site_url });
                                                mailData.html.push({ name: 'site_title', value: settingdata.settings.site_title });
                                                mailData.html.push({ name: 'logo', value: settingdata.settings.logo });
                                                mailcontent.sendmail(mailData, function (err, response) { });

                                            } else {
                                                var mailData2 = {};
                                                mailData2.template = 'SighnupmessageWithoutreferal';
                                                mailData2.to = user.email;
                                                mailData2.html = [];
                                                mailData2.html.push({ name: 'testingStatus', value: settingdata.settings.referral.status });
                                                mailData2.html.push({ name: 'name', value: user.name.first_name });
                                                mailData2.html.push({ name: 'email', value: user.email });
                                                mailData2.html.push({ name: 'site_url', value: settingdata.settings.site_url });
                                                mailData2.html.push({ name: 'site_title', value: settingdata.settings.site_title });
                                                mailData2.html.push({ name: 'logo', value: settingdata.settings.logo });
                                                mailcontent.sendmail(mailData2, function (err, response) { });
                                            }


                                            var mailData1 = {};
                                            mailData1.template = 'usersignupmessagetoadmin';
                                            mailData1.to = "";
                                            mailData1.html = [];
                                            mailData1.html.push({ name: 'name', value: user.name.first_name });
                                            mailData1.html.push({ name: 'referal_code', value: user.unique_code });
                                            mailData1.html.push({ name: 'site_url', value: settingdata.settings.site_url });
                                            mailData1.html.push({ name: 'site_title', value: settingdata.settings.site_title });
                                            mailData1.html.push({ name: 'logo', value: settingdata.settings.logo });
                                            mailcontent.sendmail(mailData1, function (err, response) { });

                                            var data = {};
                                            if (req.body.referalcode) {
                                                db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settings) {

                                                    if (err || !settings) {
                                                        data.response = 'Unable to get settings';
                                                        res.send(data);
                                                    } else {
                                                        var to = req.body.phone.code + req.body.phone.number;
                                                        var message = 'Dear ' + req.body.username + '! Thank you for registering with' + settings.settings.site_title;
                                                        twilio.createMessage(to, '', message, function (err, response) { });

                                                        db.GetOneDocument('users', { 'unique_code': req.body.referalcode }, {}, {}, function (err, referer) {
                                                            if (err || !referer) {
                                                                data.response = 'Unable to get referer';
                                                                res.send(data);
                                                            } else {
                                                                db.GetOneDocument('walletReacharge', { 'user_id': referer._id }, {}, {}, function (err, referwallet) {

                                                                    if (err) {
                                                                        data.response = 'Unable to get referwallet';
                                                                        res.send(data);
                                                                    } else {

                                                                        if (referwallet) {
                                                                            var walletArr = {
                                                                                'type': 'CREDIT',
                                                                                'credit_type': 'Referel',
                                                                                'trans_amount': settings.settings.referral.amount.referrer,
                                                                                'avail_amount': settings.settings.referral.amount.referrer,
                                                                                'trans_date': Date.now(),
                                                                                'trans_id': ''
                                                                            };
                                                                            db.UpdateDocument('walletReacharge', { 'user_id': referer._id }, { $push: { transactions: walletArr }, $set: { "total": parseInt(referwallet.total) + parseInt(settings.settings.referral.amount.referrer) } }, {}, function (referupErr, referupRespo) {
                                                                                if (referupErr || referupRespo.nModified == 0) {
                                                                                    data.response = 'Unable to get referwallet';
                                                                                    res.send(data);
                                                                                } else {
                                                                                    return done(null, user);
                                                                                }
                                                                            });
                                                                        } else {

                                                                            if (settings.settings.referral.amount.referrer) {
                                                                                var totalValue = settings.settings.referral.amount.referrer;
                                                                            } else {
                                                                                var totalValue = 0;
                                                                            }
                                                                            db.InsertDocument('walletReacharge', {
                                                                                'user_id': referer._id,
                                                                                "total": totalValue,
                                                                                'type': 'wallet',
                                                                                "transactions": [{
                                                                                    'credit_type': 'Referel',
                                                                                    'ref_id': '',
                                                                                    'trans_amount': settings.settings.referral.amount.referrer,
                                                                                    'trans_date': Date.now(),
                                                                                    'trans_id': mongoose.Types.ObjectId()
                                                                                }]
                                                                            }, function (err, result) {
                                                                                db.UpdateDocument('users', { '_id': referer._id }, { 'wallet_id': result._id }, {}, function (err, userupdate) {
                                                                                    if (err || userupdate.nModified == 0) {
                                                                                        data.response = 'Unable to get userupdate';
                                                                                        res.send(data);
                                                                                    } else {
                                                                                        return done(null, user);
                                                                                    }
                                                                                });
                                                                                return done(null, user);
                                                                            });
                                                                        }
                                                                    }
                                                                    db.InsertDocument('walletReacharge', {
                                                                        'user_id': user._id,
                                                                        "total": settings.settings.wallet.amount.welcome,
                                                                        'type': 'wallet',
                                                                        "transactions": [{
                                                                            'credit_type': 'welcome',
                                                                            'ref_id': '',
                                                                            'trans_amount': settings.settings.wallet.amount.welcome,
                                                                            'trans_date': Date.now(),
                                                                            'trans_id': mongoose.Types.ObjectId()
                                                                        }]
                                                                    }, function (err, result) {
                                                                        db.UpdateDocument('users', { '_id': user._id }, { 'wallet_id': result._id }, {}, function (err, userupdate) {
                                                                            if (err || userupdate.nModified == 0) {
                                                                                data.response = 'Unable to get userupdate';
                                                                                res.send(data);
                                                                            } else {
                                                                                return done(null, user);
                                                                            }
                                                                        });
                                                                        return done(null, user);
                                                                    });
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                            return done(null, user, settingdata);
                                        }
                                    });
                                }
                            });
                          }

                          });


                        }
                    }
                });
            });
        }));

    passport.use('tasker-register', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'pwd',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
        function (req, email, pwd, done) {

            process.nextTick(function () {
                db.GetOneDocument('tasker', { 'username': req.body.username, 'email': email }, {}, {}, function (err, user) {

                    if (err) {
                        return done(err);
                    } else {
                        if (user) {
                            return done(null, false, req.flash('Error', 'That email or username is already .'));
                        }
                        else {
                            var authHeader = generateToken();
                            function generateToken() {
                                var token = jwt.sign({
                                    id: req.body.user_name + ':' + req.body.pwd
                                }, 'token_with_username_and_password', {
                                        expiresIn: 12000
                                    });
                                return token;
                            }

                            var newUser = new Tasker();
                            newUser.username = req.body.username;
                            newUser.email = req.body.email;
                            newUser.password = newUser.generateHash(req.body.pwd);
                            newUser.role = req.body.role;

                            newUser.save(function (err) {
                                if (err) {
                                    return done(null, false, req.flash('Error', 'That email or username is already taken.'));
                                }
                                req.session.passport.header = authHeader;
                                return done(null, newUser);
                            });
                        }
                    }
                });
            });
        }));


    passport.use('adminLogin', new LocalStrategy(
        {
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, username, password, done) {
            var authHeader = jwtSign({ username: username });
            db.GetOneDocument('admins', { 'username': username, 'role': { $in: ['admin', 'subadmin'] }, 'status': 1 }, {}, {}, function (err, user) {
                if (err) {
                    return done(err);
                } else {
                    if (!user || !user.validPassword(password)) {
                        return done(null, false, { message: 'You are not authorized to sign in. Verify that you are using valid credentials' });
                    } else {
                        req.session.passport.header = authHeader;
                        var data = { activity: {} };
                        data.activity.last_login = Date();
                        db.UpdateDocument('admins', { _id: user._id }, data, {}, function (err, docdata) {
                            if (err) {
                                res.send(err);
                            } else {
                                return done(null, user);
                            }
                        });
                    }
                }
            });
        }));


    passport.use('local-site-login', new LocalStrategy(
        {
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, username, password, done) {
            // console.log(username, password);
            var authHeader = jwtSign({ username: username });
            db.GetOneDocument('users', { $or: [{ username: username }, { email: username }], 'status': { $ne: 0 } }, {}, {}, function (err, user) {
                if (err) {
                    return done(err);
                } else {
                    if (user) {
                        db.GetOneDocument('users', { '_id': user._id, 'verification_code.mobile': { $exists: false } }, {}, {}, function (err, user) {
                            if (err || !user) {
                                return done(null, false, { message: 'Please activate your account' });
                            } else {
                                if (user.password) {
                                    if (!user.validPassword(password)) {
                                        // console.log("password", user.password);
                                        return done(null, false, { message: 'Incorrect username/password.' });
                                    } else {
                                        if (user.status == 2) {
                                            // console.log("status", user.status);
                                            return done(null, false, { message: 'Your account has Suspended , Please activate your account' });
                                        }
                                        else {
                                            req.session.passport.header = authHeader;
                                            var data = { activity: {} };
                                            data.activity.last_login = Date();
                                            db.UpdateDocument('users', { _id: user._id }, data, {}, function (err, docdata) {
                                                if (err) {
                                                    res.send(err);
                                                } else {
                                                    return done(null, user, { message: 'Login Success' });
                                                }
                                            });
                                        }
                                    }
                                } else {
                                    return done(null, false, { message: 'Invalid Login, Please try again' });
                                }
                            }
                        });
                    } else {
                        return done(null, false, { message: 'Invalid Login, Please try again' });
                    }
                }
            })
        }));

    passport.use('local-taskersite-login', new LocalStrategy(
        {
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, username, password, done) {
            var authHeader = jwtSign({ username: username });

            db.GetOneDocument('tasker', { $or: [{ username: username }, { email: username }], 'status': { $in: [1, 2, 3] } }, {}, {}, function (err, user) {
                if (err) {
                    return done(err);
                } else {
                    if (!user || !user.validPassword(password)) {
                        return done(null, false, { message: 'Incorrect username/password.' });
                    } else if (user.status == 2) {
                        return done(null, false, { message: 'Your Account has been deactivated or unverified , Please contact admin for more details' });
                    } else if (user.status == 3) {
                        return done(null, false, { message: 'Admin needs to verify your account' });
                    } else {
                        req.session.passport.header = authHeader;
                        var data = { activity: {} };
                        data.activity.last_login = Date();
                        db.UpdateDocument('tasker', { _id: user._id }, data, {}, function (err, docdata) {
                            if (err) {
                                res.send(err);
                            } else {
                                return done(null, user, { message: 'Login Success' });
                            }
                        });
                    }
                }
            });
        }));


    /*

passport.use('local-signup', new LocalStrategy({
    // by default, local strategy uses username and password, we will override with email
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // allows us to pass back the entire request to the callback
},
    function (req, email, password, done) {
        process.nextTick(function () {
            User.findOne({ username: req.body.name, email: email }, function (err, user) {
                if (err)
                    return done(err);
                if (user) {
                    if (user.status == 0) {
                        user.status = 1;
                        user.save(function (err) {
                            if (err)
                                return done(null, false, req.flash('signup', 'That email is already taken.' + err));
                            return done(null, user);
                        });
                    } else {
                        return done(null, false, req.flash('signup', 'That email is already taken.'));
                    }
                }
                else {
                    var newUser = new User();
                    newUser.username = req.body.name;
                    newUser.email = email;
                    newUser.password = newUser.generateHash(password);
                    newUser.type = 'login';
                    newUser.status = 1;
                    newUser.save(function (err) {
                        if (err)
                            return done(null, false, req.flash('signup', 'That email is already taken.' + err));
                        return done(null, newUser);
                    });
                }
            });
        });
    }));
    */


    passport.use(new FacebookStrategy({
        clientID: CONFIG.SOCIAL_NETWORKS.facebookAuth.clientID,
        clientSecret: CONFIG.SOCIAL_NETWORKS.facebookAuth.clientSecret,
        callbackURL: CONFIG.SOCIAL_NETWORKS.facebookAuth.callbackURL,
        profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified']
    },
        function (req, token, refreshToken, profile, done) {
            process.nextTick(function () {
                User.findOne({ $or: [{ 'username': profile.username }, { 'email': profile.emails[0].value }] }, function (err, user) {
                    if (err) {
                        return done(err);
                    }
                    var authHeader = jwtSign({ username: profile.username });
                    if (user) {
                        if (user.status == 0) {
                            user.status = 1;
                            user.save(function (err) {
                                if (err) {
                                    return done(null, false, { error: err });
                                } else {
                                    return done(null, { "user": user, "header": authHeader });
                                }
                            });
                        } else {
                            return done(null, { "user": user, "header": authHeader }); // user found, return that user
                        }
                    } else {
                        var newUser = new User();
                        newUser.username = profile.name.givenName + profile.name.familyName;
                        newUser.email = profile.emails[0].value;
                        newUser.role = 'user';
                        newUser.type = 'facebook';
                        newUser.status = 1;
                        newUser.unique_code = library.randomString(8, '#A');
                        newUser.save(function (err) {
                            if (err) {
                                return done(null, false, { error: err });
                            }
                            else {
                                return done(null, { "user": newUser, "header": authHeader });
                            }
                        });
                    }
                });
            });
        }));

    passport.use('facebook-register', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'pwd',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
        function (req, email, pwd, done) {
            process.nextTick(function () {
                db.GetOneDocument('users', { 'username': req.body.username, 'email': email }, {}, {}, function (err, user) {
                    if (err) {
                        return done(err);
                    } else {
                        if (user) {
                            return done('Email Id Or User name already exists', false, null);
                        } else {
                            var authHeader = jwtSign({ username: req.body.username });
                            var newUser = {};
                            newUser.unique_code = library.randomString(8, '#A');
                            newUser.username = req.body.username;
                            newUser.email = req.body.email;
                            newUser.password = bcrypt.hashSync(req.body.pwd, bcrypt.genSaltSync(8), null);
                            //newUser.password = newUser.generateHash(req.body.pwd);
                            newUser.role = req.body.role;
                            newUser.status = 1;
                            //newUser.address = req.body.location;
                            newUser.location = req.body.location;
                            newUser.phone = req.body.phone;
                            if (req.body.type) {
                                newUser.type = req.body.type;
                            }
                            newUser.address = { 'city': req.body.location }
                            newUser.name = { 'first_name': req.body.firstname, 'last_name': req.body.lastname };
                            newUser.activity = { 'created': req.body.today, 'modified': req.body.today, 'last_login': req.body.today, 'last_logout': req.body.today };

                            db.InsertDocument('users', newUser, function (err, user) {
                                if (err) {
                                    return done(null, false, req.flash('Error', 'That email or username is already taken.'));
                                }
                                req.session.passport.header = authHeader;
                                var mailData = {};
                                mailData.template = 'Sighnupmessage';
                                mailData.to = user.email;
                                mailData.html = [];
                                mailData.html.push({ name: 'name', value: user.name.first_name });
                                mailData.html.push({ name: 'email', value: user.email });
                                mailData.html.push({ name: 'referal_code', value: user.unique_code });
                                mailcontent.sendmail(mailData, function (err, response) { });
                                var data = {};
                                //return done(null, user);
                                if (req.body.referalcode) {
                                    db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settings) {
                                        if (err || !settings) {
                                            data.response = 'Unable to get settings';
                                            res.send(data);
                                        } else {
                                            db.GetOneDocument('users', { 'unique_code': req.body.referalcode }, {}, {}, function (err, referer) {
                                                if (err || !referer) {
                                                    data.response = 'Unable to get referer';
                                                    res.send(data);
                                                } else {
                                                    db.GetOneDocument('walletReacharge', { 'user_id': referer._id }, {}, {}, function (err, referwallet) {
                                                        if (err) {
                                                            data.response = 'Unable to get referwallet';
                                                            res.send(data);
                                                        } else {
                                                            if (referwallet) {
                                                                var walletArr = {
                                                                    'type': 'CREDIT',
                                                                    'credit_type': 'Referel',
                                                                    'trans_amount': settings.settings.referral.amount.referrer,
                                                                    'avail_amount': settings.settings.referral.amount.referrer,
                                                                    'trans_date': Date.now(),
                                                                    'trans_id': ''
                                                                };
                                                                db.UpdateDocument('walletReacharge', { 'user_id': referer._id }, { $push: { transactions: walletArr }, $set: { "total": parseInt(referwallet.total) + parseInt(settings.settings.referral.amount.referrer) } }, {}, function (referupErr, referupRespo) {
                                                                    if (referupErr || referupRespo.nModified == 0) {
                                                                        data.response = 'Unable to get referwallet';
                                                                        res.send(data);
                                                                    } else {
                                                                        return done(null, user);
                                                                    }
                                                                });
                                                            } else {

                                                                if (settings.settings.referral.amount.referrer) {
                                                                    var totalValue = settings.settings.referral.amount.referrer;
                                                                } else {
                                                                    var totalValue = 0;
                                                                }
                                                                db.InsertDocument('walletReacharge', {
                                                                    'user_id': referer._id,
                                                                    "total": totalValue,
                                                                    'type': 'wallet',
                                                                    "transactions": [{
                                                                        'credit_type': 'Referel',
                                                                        'ref_id': '',
                                                                        'trans_amount': settings.settings.referral.amount.referrer,
                                                                        'trans_date': Date.now(),
                                                                        'trans_id': mongoose.Types.ObjectId()
                                                                    }]
                                                                }, function (err, result) {
                                                                    db.UpdateDocument('users', { '_id': referer._id }, { 'wallet_id': result._id }, {}, function (err, userupdate) {
                                                                        if (err || userupdate.nModified == 0) {
                                                                            data.response = 'Unable to get userupdate';
                                                                            res.send(data);
                                                                        } else {
                                                                            return done(null, user);
                                                                        }
                                                                    });
                                                                    return done(null, user);
                                                                });
                                                            }
                                                        }
                                                        db.InsertDocument('walletReacharge', {
                                                            'user_id': user._id,
                                                            "total": settings.settings.wallet.amount.welcome,
                                                            'type': 'wallet',
                                                            "transactions": [{
                                                                'credit_type': 'welcome',
                                                                'ref_id': '',
                                                                'trans_amount': settings.settings.wallet.amount.welcome,
                                                                'trans_date': Date.now(),
                                                                'trans_id': mongoose.Types.ObjectId()
                                                            }]
                                                        }, function (err, result) {
                                                            db.UpdateDocument('users', { '_id': user._id }, { 'wallet_id': result._id }, {}, function (err, userupdate) {
                                                                if (err || userupdate.nModified == 0) {
                                                                    data.response = 'Unable to get userupdate';
                                                                    res.send(data);
                                                                } else {
                                                                    return done(null, user);
                                                                }
                                                            });
                                                            return done(null, user);
                                                        });
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                                return done(null, user);
                            });
                        }
                    }
                });
            });
        }));
};
