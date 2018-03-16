var db = require('../../controller/adaptor/mongodb.js')
var attachment = require('../../model/attachments.js');
var middlewares = require('../../model/middlewares.js');
var async = require('async');

module.exports = function () {

  var router = {};

  router.dashboarddata = function (req, res) {
    var data = {};
		  //data.status = 0;
    async.parallel({
      ActiveCategory: function (callback) {
        db.GetDocument('category', { 'status': 1, 'parent': { $exists: false } }, {}, {}, function (err, provider) {
          if (err) {
            callback(err, provider);
          } else {
            callback(err, provider);
          }
        });
      },
      Postheader: function (callback) {
        db.GetDocument('postheader', {  'status': 1 } , {} , {}, function (err, postheader) {
          callback(err, postheader);
        });
      },
      Features: function (callback) {
        db.GetOneDocument('settings', { alias: 'widgets' }, { 'settings.features': 1 }, {}, function (err, provider) {
          callback(err, provider.settings.features);
        });
      },
      Prefooter: function (callback) {
        db.GetOneDocument('settings', { alias: 'widgets' }, { 'settings.why_use_quickrabbit': 1 }, {}, function (err, provider) {
          callback(err, provider.settings.why_use_quickrabbit);
        });
      }
    }, function (err, result) {
      if (err || !result) {
        data.response = 'No Data';
        res.send(data);
      } else {
        var manipulation = {};
        manipulation.Activecategory = result.ActiveCategory;
        manipulation.Postheader = result.Postheader;
        manipulation.Features = result.Features;
        manipulation.Prefooter = result.Prefooter;
        //data.status   = 1;
        data.response = {};
        data.response.landinginfo = [];
        data.response.landinginfo.push({ 'ActiveCategory': manipulation.Activecategory });
        data.response.landinginfo.push({ 'PostHeader': manipulation.Postheader });
        data.response.landinginfo.push({ 'Features': manipulation.Features });
        data.response.landinginfo.push({ 'Prefooter': manipulation.Prefooter });
        res.send(data);
      }
    });
  };

  router.searchSuggestions = function (req, res) {
    var data = req.body.data;
    var name = new RegExp(data, 'i');
    db.GetAggregation('category', [
      { $match: { 'status': { $ne: 0 }, $or: [ { 'name': { $regex: name } }, { 'skills.tags': { $regex: name } } ] } },
      { $project: { _id: '$_id', name: '$name', slug: '$slug', parent: '$parent', skills: '$skills' } }
      ],function (err, doc) {
        if (err) {
          res.send(err);
        } else {
          res.send(doc);
        }
      });
  }
  return router;
};
