var CONFIG = require('../config/config');
var async = require("async");
var db = require('../controller/adaptor/mongodb.js');

function getsettings()  {
  async.waterfall([
      function (callback) {
          db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settings) {
              if (err || !settings) { data.response = 'Configure your website settings'; res.send(data); }
              else { callback(err, settings.settings); }
          });
      }
    ],function (err, settings) {


      return settings;

  });
}

module.exports = {
      "getsettings" : getsettings
};
