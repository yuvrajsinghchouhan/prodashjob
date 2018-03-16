var builder = require('xmlbuilder');
var db = require('../../controller/adaptor/mongodb.js');
var async = require('async');



module.exports = function () {
    var router = {};

    router.sitemap = function (req, res) {

        async.waterfall([
            function (callback) {
                db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settings) {
                    callback(err, settings.settings);
                });
            },
            function (settings, callback) {
                db.GetDocument('category', { 'status': { $eq: 1 }, parent: { $exists: false } }, {}, {}, function (err, categories) {
                    callback(err, settings, categories);
                });
            }, function (settings, categories, callback) {
                db.GetDocument('pages', { 'status': { $eq: 1 } }, {}, {}, function (err, pagedata) {
                    callback(err, settings, categories, pagedata);
                });
            }
        ], function (err, settings, categories, pagedata) {

            var urls = [];
            var data = {};
            data.loc = settings.site_url;
            //data.changefreq = 'weekly';
            //data.priority = '0.8';
            urls.push(data);

            for (var i = 0; i < categories.length; i++) {
                var data = {};
                data.loc = settings.site_url + 'category/' + categories[i].slug;
                //data.lastmod = categories[i].updatedAt;
                urls.push(data);
            }

            for (var i = 0; i < pagedata.length; i++) {
                var data = {};
                data.loc = settings.site_url + 'page/' + pagedata[i].slug;
                //data.lastmod = pagedata[i].updatedAt;
                urls.push(data);
            }

            var xmlJSON = {
                urlset: {
                    '@xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
                    url: urls
                }
            };
            var xml = builder.create(xmlJSON, { encoding: 'utf-8' })
            res.header('Content-Type', 'application/xml');
            res.send(xml.end({ pretty: true }));
        });
    }

    return router;
};
