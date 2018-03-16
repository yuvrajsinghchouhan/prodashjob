module.exports = function (io) {
  var db = require('../controller/adaptor/mongodb.js');
  var async = require("async");
  var mongoose = require("mongoose");
  var CONFIG = require('../config/config');
  var apn = require('apn');
  var timezone = require('moment-timezone');

  var usernames = {};
  var rooms = [];
  var chatRooms = [];
  var notifyRooms = [];

  var chat = io.of('/chat');
  var notify = io.of('/notify');

  chat.on('connection', function (socket) {
    socket.on('new message', function (data) {
      console.log("asdfasdfasdfasdf", data)
      var messageData = {};
      messageData.user = data.user;
      messageData.tasker = data.tasker;
      messageData.task = data.task;
      messageData.from = data.from;
      messageData.message = data.message;
      messageData.status = 1;
      async.parallel({
        task: function (callback) {
          var extension = {};
          extension.populate = 'user';
          db.GetOneDocument('task', { '_id': data.task, 'user': data.user }, { 'user': 1 }, extension, function (err, response) {
            callback(err, response);
          });
        },
        tasker: function (callback) {
          db.GetOneDocument('tasker', { '_id': data.tasker }, { 'device_info': 1 }, {}, function (err, response) {
            callback(err, response);
          });
        },
        settings: function (callback) {
          db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, response) {
            callback(err, response.settings);
          });
        }
      }, function (err, result) {
        if (!err || !result.task.user || !result.tasker) {
          db.InsertDocument('messages', messageData, function (err, document) {
            if (err || !document) {
              socket.emit('updatechat', 'Unable to fetch the user');
            } else {
              var data = {};
              data.user = document.user;
              data.tasker = document.tasker;
              data.task = document.task;
              data.messages = [];
              data.status = document.status;
              var messages = {};
              messages._id = document._id;
              messages.message = document.message;
              messages.from = document.from;
              messages.status = document.status;
              messages.user_status = document.user_status;
              messages.tasker_status = document.tasker_status;
              messages.date = timezone.tz(document.createdAt, result.settings.time_zone).format(result.settings.date_format + ',' + result.settings.time_format);
              data.messages.push(messages);

              var type = '';
              var receiver = {};
              if (messages.from.toString() == data.tasker.toString()) {
                type = 'user';
                receiver = result.task.user;
                sender = data.tasker;
              } else {
                type = 'tasker';
                receiver = result.tasker;
                sender = data.user;
              }

              if (receiver.device_info.device_token) {
                if (receiver.device_info.ios_notification_mode == 'apns') {

                  var options = {};
                  var topic = '';

                  if (type == 'user') {
                    options = { cert: CONFIG.APNS.CERT_USER, key: CONFIG.APNS.KEY, production: CONFIG.APNS.MODE };
                    topic = CONFIG.APNS.BUNDLE_ID_USER;
                  } else if (type == 'tasker') {
                    options = { cert: CONFIG.APNS.CERT_TASKER, key: CONFIG.APNS.KEY, production: CONFIG.APNS.MODE };
                    topic = CONFIG.APNS.BUNDLE_ID_TASKER;
                  }

                  var apnProvider = new apn.Provider(options);
                  var deviceToken = receiver.device_info.device_token;
                  var note = new apn.Notification();
                  note.expiry = Math.floor(Date.now() / 1000) + 3600;
                  note.sound = 'ping.aiff';
                  note.alert = messages.message;
                  note.payload = data;
                  note.topic = topic;
                  apnProvider.send(note, deviceToken).then((result) => { });
                } else {
                  chat.in(data.user).emit('updatechat', data);
                  chat.in(data.tasker).emit('updatechat', data);
                }
              }

              if (receiver.device_info.gcm) {
                chat.in(data.user).emit('updatechat', data);
                chat.in(data.tasker).emit('updatechat', data);
              }

              chat.in(data.user).emit('webupdatechat', data);
              chat.in(data.tasker).emit('webupdatechat', data);
            }
          });
        }
      });
    });

    socket.on('create room', function (data) {
      var room = data.user;
      if (room) {
        if (chatRooms.indexOf(room) == -1) {
          chatRooms.push(room);
        }
        socket.join(room);
        socket.emit('roomcreated', room);
      }
    });

    socket.on('start typing', function (data) {
      var typing = {};
      typing.user = data.from;
      typing.chat = {};
      typing.chat.user = data.user;
      typing.chat.tasker = data.tasker;
      typing.chat.task = data.task;
      typing.chat.type = data.type;
	  console.log("typing",typing)
      chat.in(data.to).emit('start typing', typing);
    });

    socket.on('stop typing', function (data) {
      var typing = {};
      typing.user = data.from;
      typing.chat = {};
      typing.chat.user = data.user;
      typing.chat.tasker = data.tasker;
      typing.chat.task = data.task;
      typing.chat.type = data.type;
      chat.in(data.to).emit('stop typing', typing);
    });

    socket.on('single message status', function (data) {
      console.log("singlemessagesstatusdata", data);
      var type = data.usertype;
      var query = {};
      var update = {};
      var sendto = '';
      if (type == 'user') {
        query = { task: data.task, user: data.user, tasker: data.tasker, user_status: 1 };
        update = { user_status: 2 };
        sendto = data.tasker;
      } else {
        query = { task: data.task, user: data.user, tasker: data.tasker, tasker_status: 1 };
        update = { tasker_status: 2 };
        sendto = data.user;
      }

      db.UpdateDocument('messages', query, update, { multi: true }, function (err, result) {
        console.log("result", result);
        if (err) {
          res.send(err);
        } else {
          chat.in(sendto).emit('single message status', data);
        }
      });
    });

    socket.on('message status', function (data) {
      async.parallel({
        settings: function (callback) {
          db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, response) {
            callback(err, response.settings);
          });
        }
      }, function (err, result) {
        if (!err) {
          var sendto = '';
          if (data.type == 'user') {
            sendto = data.tasker;
          } else if (data.type == 'tasker') {
            sendto = data.user;
          }
          var condition = [
            { $match: { 'status': 1, $or: [{ 'user': mongoose.Types.ObjectId(data.user), 'tasker': mongoose.Types.ObjectId(data.tasker) }, { 'user': mongoose.Types.ObjectId(data.tasker), 'tasker': mongoose.Types.ObjectId(data.user) }], 'task': mongoose.Types.ObjectId(data.task), } },
            { $lookup: { 'from': 'users', 'localField': 'user', 'foreignField': '_id', 'as': 'user' } },
            { $lookup: { 'from': 'tasker', 'localField': 'tasker', 'foreignField': '_id', 'as': 'tasker' } },
            { $unwind: "$user" },
            { $unwind: "$tasker" },
            {
              $group: { _id: "$task", user: { $first: "$user" }, tasker: { $first: "$tasker" }, task: { $first: "$task" }, messages: { $push: { from: "$from", message: "$message", date: "$createdAt", status: "$status", user_status: "$user_status", tasker_status: "$tasker_status" } } }
            }
          ];
          db.GetAggregation('messages', condition, function (err, messages) {
            if (err || !messages[0]) {
              chat.in(sendto).emit('message status', []);
            } else {
              var data = {};
              data.user = messages[0].user._id;
              data.tasker = messages[0].tasker._id;
              data.task = messages[0].task;
              data.messages = messages[0].messages;
              for (var i = 0; i < messages[0].messages.length; i++) {
                messages[0].messages[i].date = timezone.tz(messages[0].messages[i].date, result.settings.time_zone).format(result.settings.date_format + ',' + result.settings.time_format);
              }
              chat.in(sendto).emit('message status', data);
            }
          });
        }
      });
    });

    socket.on('disconnect', function (data) {
      if (data) {
        if (data.user) {
          var room = data.user;
          delete chatRooms[room];
          socket.emit('disconnect', room);
          socket.leave(room);
        }
      }
    });
  });


  notify.on('connection', function (socket) {

    socket.on('join network', function (data) {
      var room = data.user;
      if (room) {
        if (notifyRooms.indexOf(room) == -1) {
          notifyRooms.push(room);
        }
        socket.join(room);
        socket.emit('network created', room);
      }
    });

    socket.on('tasker tracking', function (data) {
      notify.in(data.user).emit('tasker tracking', data);
    });

    socket.on('network disconnect', function (data) {
      if (data) {
        if (data.user) {
          var room = data.user;
          delete notifyRooms[room];
          socket.emit('network disconnect', room);
          socket.leave(room);
        }
      }
    });

  });
};
