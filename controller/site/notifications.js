var db = require('../../controller/adaptor/mongodb.js')
var CONFIG = require('../../config/config');
var mongoose = require("mongoose");

module.exports = function () {

  var controller = {};

  controller.getCount = function getCount(req, res) {
    var condition = {};
    if (req.body.type == 'tasker') {
      condition = { tasker: req.body.user, type: req.body.type, status: 1 };
    } else if (req.body.type == 'user') {
      condition = { user: req.body.user, type: req.body.type, status: 1 };
    }

    db.GetCount('notifications', condition, function (err, usermsgcount) {
      if (err || !usermsgcount) {
        res.send({ count: 0 });
      } else {
        res.send({ count: usermsgcount });
      }
    });
  }

  controller.getList = function getList(req, res) {

    var limit = parseInt(req.body.itemsCount);
    var skip = 0;
    if (req.body.skip) {
      var tmp = parseInt(req.body.skip);
      if (tmp != NaN && tmp > 0) {
        skip = tmp;
      }
    }
    if (limit == '0' || limit == 'undefined' || limit == '' || isNaN(limit)) {
      limit = 12;
    }

    var condition = {};
    if (req.body.data.type == 'tasker') {
      condition = { tasker: req.body.data.user, type: req.body.data.type, status: 1 };
    } else if (req.body.data.type == 'user') {
      condition = { user: req.body.data.user, type: req.body.data.type, status: 1 };
    }

    db.UpdateDocument('notifications', condition, { status: 2 }, { multi: true }, function (err, result) {
      if (err) {
        res.send(err);
      } else {
        var icondition = {};
        if (req.body.data.type == 'tasker') {
          icondition = { 'status': { $ne: 0 }, 'tasker': mongoose.Types.ObjectId(req.body.data.user), 'type': req.body.data.type };
        } else if (req.body.data.type == 'user') {
          icondition = { 'status': { $ne: 0 }, 'user': mongoose.Types.ObjectId(req.body.data.user), 'type': req.body.data.type };
        }
        var condition = [
          { $match: icondition },
          { $lookup: { 'from': 'task', 'localField': 'raw_data.key0', 'foreignField': 'booking_id', 'as': 'task' } },
          { $sort: { createdAt: -1 } },
          { $group: { _id: "$task.booking_id", 'task': { '$push': '$task' }, 'rawdata': { '$push': '$raw_data' }, 'messages': { '$push': '$message' }, 'createdAt': { '$push': '$createdAt' } } },
          { $group: { _id: null, 'document': { '$push': '$$ROOT' }, 'count': { '$sum': 1 } } },
          { $unwind: "$document" },
          { $project: { '_id': '$document._id', 'task': '$document.task', 'rawdata': '$document.rawdata', 'messages': '$document.messages', 'createdAt': '$document.createdAt', 'count': 1 } },
          { $skip: skip },
          { $limit: limit }
        ];

        db.GetAggregation('notifications', condition, function (err, notifications) {
          if (err) {
            res.send(err);
          } else {
            res.send(notifications);
          }
        });
      }
    });
  }

  return controller;
};
