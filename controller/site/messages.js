var db = require('../../controller/adaptor/mongodb.js')
var mongoose = require('mongoose');
var CONFIG = require('../../config/config');
var async = require("async");
var timezone = require('moment-timezone');

module.exports = function () {
  var controller = {};

  controller.save = function (req, res) {
    db.InsertDocument('messages', req.body, function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    });
  }

  controller.getmessage = function (req, res) {
    //var limit = 0;
    //var skip = 0;
    //if (typeof req.body.limit != 'undefined' && typeof req.body.skip != 'undefined') {
    limit = parseInt(req.body.limit);
    if (limit) {
      var tmp = parseInt(limit);
      if (tmp != NaN && tmp > 0) {
        limit = tmp;
      } else {
        limit = 12;
      }
    }

    skip = parseInt(req.body.skip);
    if (skip) {
      var tmp = parseInt(skip);
      if (tmp != NaN && tmp > 0) {
        skip = tmp;
      } else {
        skip = 12;
      }
    }

    var user = req.body.userId;
    var type = req.body.currentusertype;
    var matchcase = {};

    if (type == 'user') {
      matchcase = { 'status': 1, 'user_delete_status': { $ne: 0 }, 'user': mongoose.Types.ObjectId(user) };
    } else if (type == 'tasker') {
      matchcase = { 'status': 1, 'tasker_delete_status': { $ne: 0 }, 'tasker': mongoose.Types.ObjectId(user) };
    }

    var condition = [
      { $match: matchcase },
      { $lookup: { 'from': 'users', 'localField': 'user', 'foreignField': '_id', 'as': 'user' } },
      { $lookup: { 'from': 'tasker', 'localField': 'tasker', 'foreignField': '_id', 'as': 'tasker' } },

      { $group: { '_id': { 'task': '$task' }, 'messages': { '$first': '$message' }, 'user': { '$first': '$user' }, 'tasker': { '$first': '$tasker' }, 'user_status': { '$last': '$user_status' }, 'tasker_status': { '$last': '$tasker_status' }, 'from': { '$last': '$from' }, 'count': { $sum: 1 } } },
      {
        $project: {
          '_id': 0, 'messages': 1, 'tasker': 1, 'count': 1, 'user_status': 1, 'tasker_status': 1, 'from': 1, 'task': '$_id.task',
          'user': {
            $let: {
              vars: { user: { $filter: { input: "$user", as: "user", cond: { $eq: ["$$user._id", new mongoose.Types.ObjectId(user)] } } } },
              in: { $cond: { if: { $eq: [{ "$size": ["$$user"] }, 1] }, then: '$tasker', else: "$user" } }
            }
          }
        }
      },
      { $lookup: { 'from': 'task', 'localField': 'task', 'foreignField': '_id', 'as': 'task' } },
      { $unwind: { path: '$task', preserveNullAndEmptyArrays: true } },
      { '$skip': skip },
      { '$limit': limit }
    ];
    db.GetAggregation('messages', condition, function (err, messages) {
      if (err) {
        res.send(err);
      } else {
        var user = req.body.userId;
        var type = req.body.currentusertype;
        var matchcase = {};

        if (type == 'user') {
          matchcase = { 'status': 1, 'user_delete_status': { $ne: 0 }, 'user': mongoose.Types.ObjectId(user) };
        } else if (type == 'tasker') {
          matchcase = { 'status': 1, 'tasker_delete_status': { $ne: 0 }, 'tasker': mongoose.Types.ObjectId(user) };
        }
        var condition = [
          { $match: matchcase },
          { $lookup: { 'from': 'users', 'localField': 'user', 'foreignField': '_id', 'as': 'user' } },
          { $lookup: { 'from': 'tasker', 'localField': 'tasker', 'foreignField': '_id', 'as': 'tasker' } },
          { $group: { '_id': { 'task': '$task' }, 'messages': { '$first': '$message' }, 'user': { '$first': '$user' }, 'tasker': { '$first': '$tasker' }, 'user_status': { '$last': '$user_status' }, 'tasker_status': { '$last': '$tasker_status' }, 'from': { '$last': '$from' }, 'count': { $sum: 1 } } },
          {
            $project: {
              '_id': 0, 'messages': 1, 'tasker': 1, 'count': 1, 'user_status': 1, 'tasker_status': 1, 'from': 1, 'task': '$_id.task',
              'user': {
                $let: {
                  vars: { user: { $filter: { input: "$user", as: "user", cond: { $eq: ["$$user._id", new mongoose.Types.ObjectId(user)] } } } },
                  in: { $cond: { if: { $eq: [{ "$size": ["$$user"] }, 1] }, then: '$tasker', else: "$user" } }
                }
              }
            }
          },
          { $lookup: { 'from': 'task', 'localField': 'task', 'foreignField': '_id', 'as': 'task' } },
          { $unwind: { path: '$task', preserveNullAndEmptyArrays: true } }
        ];
        db.GetAggregation('messages', condition, function (err, messagescount) {
          if (err) {
            res.send(err);
          } else {

            res.send({ count: messagescount, messages: messages });
            //res.send(messagescount);
          }
        });
        //res.send(messages);
      }
    });
  }

  controller.chathistory = function (req, res) {
    var user = req.body.user;
    var tasker = req.body.tasker;
    var task = req.body.task;
    var type = req.body.type;

    var query = {};
    if (type == 'user') {
      query = { task: req.body.task, user: req.body.user, tasker: req.body.tasker };
      update = { $set: { "user_status": 2 } };
    } else if (type == 'tasker') {
      query = { task: req.body.task, user: req.body.user, tasker: req.body.tasker };
      update = { $set: { "tasker_status": 2 } };
    }

    db.UpdateDocument('messages', query, update, { multi: true }, function (err, result) {
      if (err) {
        res.send(err);
      } else {
        async.parallel({
          user: function (callback) {
            db.GetOneDocument('users', { '_id': user }, { 'name.first_name': 1, 'username': 1, 'avatar': 1 }, {}, function (err, response) {
              callback(err, response);
            });
          },
          tasker: function (callback) {
            db.GetOneDocument('tasker', { '_id': tasker }, {'name.first_name': 1, 'username': 1, 'avatar': 1 }, {}, function (err, response) {
              callback(err, response);
            });
          },
          settings: function (callback) {
            db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, response) {
              callback(err, response);
            });
          }
        }, function (err, result) {
          if (err) {
            data.response = "You're not a valid user";
            res.send(data);
          } else {
            var condition = [
              { $match: { 'status': 1, $or: [{ 'user': mongoose.Types.ObjectId(user), 'tasker': mongoose.Types.ObjectId(tasker) }, { 'user': mongoose.Types.ObjectId(tasker), 'tasker': mongoose.Types.ObjectId(user) }], 'task': mongoose.Types.ObjectId(task), } },
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
                var message = {};
                message.user = result.user;
                message.tasker = result.tasker;
                message.task = task;
                if (message.user) {
                  if (message.user.avatar) {
                    message.user.avatar = result.settings.settings.site_url + message.user.avatar;
                  } else {
                    message.user.avatar = result.settings.settings.site_url + CONFIG.USER_PROFILE_IMAGE_DEFAULT;
                  }
                }

                if (message.tasker) {
                  if (message.tasker.avatar) {
                    message.tasker.avatar = result.settings.settings.site_url + message.tasker.avatar;
                  } else {
                    message.tasker.avatar = result.settings.settings.site_url + CONFIG.USER_PROFILE_IMAGE_DEFAULT;
                  }
                }

                message.messages = [];
                message.status = '1';
                res.send(message);
              } else {

                for (var i = 0; i < messages[0].messages.length; i++) {
                  messages[0].messages[i].date = timezone.tz(messages[0].messages[i].date, result.settings.settings.time_zone).format(result.settings.settings.date_format + ',' + result.settings.settings.time_format);
                }

                if (messages[0].user.avatar) {
                  messages[0].user.avatar = result.settings.settings.site_url + messages[0].user.avatar;
                } else {
                  messages[0].user.avatar = result.settings.settings.site_url + CONFIG.USER_PROFILE_IMAGE_DEFAULT;
                }

                if (messages[0].tasker.avatar) {
                  messages[0].tasker.avatar = result.settings.settings.site_url + messages[0].tasker.avatar;
                } else {
                  messages[0].tasker.avatar = result.settings.settings.site_url + CONFIG.USER_PROFILE_IMAGE_DEFAULT;
                }
                messages[0].status = '1';
                res.send(messages[0]);
              }
            });
          }
        });
      }
    });
  }

  controller.deleteConversation = function deleteConversation(req, res) {


    var query = {};
    if (req.body.usertype == 'user') {
      query = { task: req.body.chatinfo.taskid, user: req.body.chatinfo.userid, tasker: req.body.chatinfo.taskerid };
      update = { $set: { "user_delete_status": 0 } };
    }
    else if (req.body.usertype == 'tasker') {
      query = { task: req.body.chatinfo.taskid, user: req.body.chatinfo.userid, tasker: req.body.chatinfo.taskerid };
      update = { $set: { "tasker_delete_status": 0 } };
    }
    db.UpdateDocument('messages', query, update, { multi: true }, function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    });
  }

  controller.msgcount = function msgcount(req, res) {
    var matchcase = {};
    if (req.body.type == 'user') {
      matchcase = { user: new mongoose.Types.ObjectId(req.body.user), 'user_delete_status': { $ne: 0 }, status: { $ne: 0 }, user_status: 1, from: { $ne: new mongoose.Types.ObjectId(req.body.user) } };
    } else if (req.body.type == 'tasker') {
      matchcase = { tasker: new mongoose.Types.ObjectId(req.body.user), 'tasker_delete_status': { $ne: 0 }, status: { $ne: 0 }, tasker_status: 1, from: { $ne: new mongoose.Types.ObjectId(req.body.user) } };
    }

    var condition = [
      { $match: matchcase },
      { $lookup: { 'from': 'task', 'localField': 'task', 'foreignField': '_id', 'as': 'task' } },
      { $unwind: { path: '$task' } },
      { "$group": { "_id": null, "count": { "$sum": 1 } } }
    ];
    db.GetAggregation('messages', condition, function (err, usermsgcount) {
      if (err || !usermsgcount[0]) {
        res.send({ count: 0 });
      } else {
        res.send({ count: usermsgcount[0].count });
      }
    });
  }

  controller.unreadmsg = function (req, res) {

    var user = req.body.user;
    var type = req.body.type;

    var matchcase = {};
    if (type == 'user') {
      matchcase = { 'status': 1, 'user_status': 1, 'user': mongoose.Types.ObjectId(user) };
    } else if (type == 'tasker') {
      matchcase = { 'status': 1, 'tasker_status': 1, 'tasker': mongoose.Types.ObjectId(user) };
    }
    var condition = [
      { $match: matchcase },
      { $lookup: { 'from': 'users', 'localField': 'user', 'foreignField': '_id', 'as': 'user' } },
      { $lookup: { 'from': 'tasker', 'localField': 'tasker', 'foreignField': '_id', 'as': 'tasker' } },
      { $group: { '_id': { 'task': '$task' }, 'messages': { '$first': '$message' }, 'user': { '$first': '$user' }, 'tasker': { '$first': '$tasker' }, 'count': { $sum: 1 } } },
      {
        $project: {
          '_id': 0, 'count': 1
        }
      },
      { $lookup: { 'from': 'task', 'localField': 'task', 'foreignField': '_id', 'as': 'task' } },
      { $unwind: { path: '$task', preserveNullAndEmptyArrays: true } }
    ];
    db.GetAggregation('messages', condition, function (err, messages) {
      if (err) {
        res.send(err);
      } else {
        res.send(messages);
      }
    });
  }

  return controller;
};
