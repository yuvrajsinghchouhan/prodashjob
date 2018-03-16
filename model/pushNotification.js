module.exports = function (io) {
    var socketData = {};
    var path = require('path');
    var db = require('../controller/adaptor/mongodb.js');
    var apn = require('apn');
    var gcm = require('node-gcm');
    var CONFIG = require('../config/config');


    io.sockets.on('connection', function (socket) {
        socket.on('room', function (room) {
            socketData.room = room;
            socket.join(room);
        });

        socket.on('switch room', function (data) {
            socket.leave(socketData.room);
            socketData.room = data;
            socket.join(data);
        });

        socket.on('disconnect', function (userid, providerid) {
            socket.leave(socketData.room);
        });
    });

    return {
        sendPushnotification: function (regIds, message, action, type, urlval, app, callback) {
            var send_message = {};
            var data = {};
            send_message['message'] = message || '';
            send_message['action'] = action;

            if (urlval instanceof Array) {
                for (var i = 0; i < urlval.length; i++) {
                    send_message['key' + i] = urlval[i];
                    data['key' + i] = urlval[i];
                }
            } else {
                Object.keys(urlval).forEach(function (key, i) {
                    send_message['key' + i] = urlval[key];
                    data['key' + i] = urlval[key];
                });
            }

            var collection = '';
            if (app == 'PROVIDER') {
                collection = 'tasker';
                type = 'tasker';
            } else if (app == 'USER') {
                collection = 'users';
                type = 'user';
            }

            //var searchQuery = { '_id': regIds };

            db.GetDocument(collection, { '_id': regIds }, {}, {}, function (pushErr, pushRespo) {
                if (!pushErr && pushRespo[0]) {
                    var notification = {};
                    if (type == 'user') {
                        notification.user = regIds;
                    } else if (type == 'tasker') {
                        notification.tasker = regIds;
                    }
                    notification.type = type;
                    notification.message = send_message.message;
                    notification.raw_data = send_message;
                    db.InsertDocument('notifications', notification, function (err, docdata) {
                        if (!err) {
                            var username = pushRespo[0]._id;
                            if (pushRespo[0].device_info) {


                                if (pushRespo[0].device_info.device_token) {
                                    if (pushRespo[0].device_info.ios_notification_mode == 'apns') {
                                        var options = {};
                                        var topic = '';
                                        if (collection == 'users') {
                                            options = { cert: CONFIG.APNS.CERT_USER, key: CONFIG.APNS.KEY, production: CONFIG.APNS.MODE };
                                            topic = CONFIG.APNS.BUNDLE_ID_USER;
                                        } else if (collection == 'tasker') {
                                            options = { cert: CONFIG.APNS.CERT_TASKER, key: CONFIG.APNS.KEY, production: CONFIG.APNS.MODE };
                                            topic = CONFIG.APNS.BUNDLE_ID_TASKER;
                                        }
                                        var apnProvider = new apn.Provider(options);
                                        var deviceToken = pushRespo[0].device_info.device_token;
                                        var note = new apn.Notification();
                                        note.expiry = Math.floor(Date.now() / 1000) + 3600;
                                        note.sound = 'ping.aiff';
                                        note.alert = send_message.message;
                                        note.payload = send_message;
                                        note.topic = topic;
                                        apnProvider.send(note, deviceToken).then((result) => {console.log("result",result) });
                                    } else {
                                        io.of('/notify').in(regIds).emit('notification', { username: username, message: send_message });
                                    }
                                }

                                if (pushRespo[0].device_info.gcm) {
                                    if (pushRespo[0].device_info.android_notification_mode == 'gcm') {
                                        var message = new gcm.Message({
                                            data: data,
                                            notification: {
                                                title: send_message.message,
                                                icon: "ic_launcher",
                                                body: send_message.message
                                            }
                                        });
                                        var sender = new gcm.Sender(CONFIG.GCM_KEY);
                                        var regTokens = [pushRespo[0].device_info.gcm];
                                        sender.send(message, {
                                            registrationTokens: regTokens
                                        }, function (err, response) {
                                            console.log(err, response);
                                        });
                                    } else {
                                        io.of('/notify').in(regIds).emit('notification', { username: username, message: send_message });
                                    }
                                }

                                io.of('/notify').in(regIds).emit('web notification', { username: username, message: send_message });
                            }
                            callback("err", "httpResponse", send_message);
                        }
                    });
                }
            });
        }
    };
};
