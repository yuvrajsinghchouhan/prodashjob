var db = require('../../controller/adaptor/mongodb.js');
var attachment = require('../../model/attachments.js');
var middlewares = require('../../model/middlewares.js');
var async = require('async');

module.exports = function () {

	var router = {};

	router.getsubcategory = function getsubcategory(req, res) {

		var data = {};
		var limit = parseInt(req.body.itemsCount) || 12;
		var skip = parseInt(req.body.skip) || 0;

		var slug = req.body.slug;
		if (slug) {
			async.parallel({
				ActiveCategory: function (callback) {
					db.GetAggregation('category', [
						{ $match: { "slug": slug, 'status': 1 } },
						{ '$lookup': { from: 'categories', localField: '_id', foreignField: 'parent', as: 'subcategory' } },
						{
							$project: {
								parentcategory: { _id: '$_id', name: '$name', slug: '$slug', position: '$position', status: '$status', skills: '$skills', image: '$image', seo: '$seo', parent: '$parent', commission: '$commission' },
								subcategory: {
									$filter: {
										input: "$subcategory",
										as: "subcategory",
										cond: { $eq: ["$$subcategory.status", 1] }
									}
								}
							}
						},
						{
							$project: {
								parentcategory: 1,
								subcategory: { $slice: ["$subcategory", skip, limit] },
								totalsubcategory: { $size: "$subcategory" }
							}
						}
					], function (err, doc) {
						callback(err, doc)
					})
				},
				Postheader: function (callback) {
					db.GetDocument('postheader', { 'status': 1 }, {}, {}, function (err, postheader) {
						callback(err, postheader);
					});
				}
			}, function (err, result) {
				if (err || !result) {
					data.response = 'No Data';
					res.send(data);
				} else {
					data.response = {};
					data.response.ActiveCategory = result.ActiveCategory[0];
					res.send(data);
				}
			});
		}
	}


	router.getcategorylist = function (req, res) {
		db.GetAggregation('category', [
			{ $match: { 'status': 1, parent: { $exists: false } } },
			{ $lookup: { from: 'categories', localField: "_id", foreignField: "parent", as: "category" } },
			{
				$project: {
					_id: '$_id', name: '$name', slug: '$slug', parent: '$parent', category: {
						$filter: {
							input: "$category",
							as: "category",
							cond: { $eq: ["$$category.status", 1] }
						}
					},
					skills: '$skills'
				}
			},

		], function (err, doc) {
			if (err) {
				res.send(err);
			} else {
				res.send(doc);
			}
		});
	}


	router.getsubcategoryfordropdown = function (req, res) {
		db.GetDocument('category', { 'status': 1, 'parent': req.body.categoryid }, {}, {}, function (err, docdata) {
			if (err) {
				res.send(err);
			} else {
				res.send(docdata);
			}
		});
	}


	router.getcategorybyskils = function getcategorybyskils(req, res) {
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
		var slug = req.query.slug;
		var sluglen = slug.length;
		if (slug != '' && slug != '0' && typeof slug != 'undefined') {
			db.GetAggregation('category', [
				{ $match: { 'status': 1 } },
				{
					$project: {
						_id: '$_id', parent: '$parent', skills: '$skills',
						skillsFilter: {
							$let: {
								vars: {
									skills: {
										$filter: {
											input: "$skills",
											as: "skills",
											cond: { $eq: [{ "$substr": ["$$skills.tags", 0, sluglen] }, slug] }
										}
									}
								}, in: { $size: "$$skills" }
							}
						}
					}
				},
				{ $match: { skillsFilter: { $gt: 0 } } },
				{ '$lookup': { from: 'categories', localField: 'parent', foreignField: '_id', as: 'SearchCategory' } },
				{ '$unwind': { path: "$SearchCategory", preserveNullAndEmptyArrays: true } },
				{
					$group: {
						_id: 'null',
						SearchCategory: { $addToSet: "$SearchCategory" }
					}
				},
				{
					$project: {
						SearchCategory: { $slice: ["$SearchCategory", skip, limit] },
						totalSearchCategory: { $size: "$SearchCategory" }
					}
				}
			]
				, function (err, doc) {
					if (err) {
						res.send(err);
					} else {
						res.send(doc);
					}
				});
		} else {
			res.send([]);
		}
	};


	return router;
};
