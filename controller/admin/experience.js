"use strict";

module.exports = function () {

	var mongoose = require('mongoose');
	var db = require('../../controller/adaptor/mongodb.js');


	var controller = {};
	controller.save = function (req, res) {
		req.checkBody('name', 'Invalid name').notEmpty();
		req.checkBody('status', 'Invalid status').notEmpty();

		var errors = req.validationErrors();
		if (errors) {
			res.send(errors, 400);
			return;
		}

		if (req.body._id) {
			db.UpdateDocument('experience', { _id: req.body._id }, req.body, {}, function (err, docdata) {
				if (err) {
					res.send(err);
				} else {
					res.send(docdata);
				}
			});
		} else {
			db.InsertDocument('experience', req.body, function (err, result) {
				if (err) {
					res.send(err);
				} else {
					res.send(result);
				}
			});
		}
	};

	controller.edit = function (req, res) {
		var errors = req.validationErrors();
		if (errors) {
			res.send(errors, 400);
			return;
		}
		db.GetOneDocument('experience', { _id: req.body.id }, {}, {}, function (err, docdata) {
			if (err) {
				res.send(err);
			} else {
				res.send(docdata);
			}
		});
	};

	controller.list = function (req, res) {

		var errors = req.validationErrors();
		if (errors) {
			res.send(errors, 400);
			return;
		}

		if (req.body.sort) {
			var sorted = req.body.sort.field;
		}


		var experienceQuery = [{
			"$match": { status: { $ne: 0 } }
		}, {
			$project: {
				name: 1,
				experience: 1,
				status: 1,
				updatedAt: 1,
				dname: { $toLower: '$' + sorted }
			}
		}, {
			$project: {
				username: 1,
				document: "$$ROOT"
			}
		}, {
			$group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
		}];


		var condition = { status: { $ne: 0 } };
		experienceQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });

		if (req.body.search) {
			condition['name'] = { $regex: new RegExp('^' + req.body.search, 'i') };
			var searchs = req.body.search;
			experienceQuery.push({ "$match": { "documentData.name": { $regex: searchs + '.*', $options: 'si' } } });
			  //search limit
             experienceQuery.push({$group: { "_id": null, "countvalue": { "$sum": 1 }, "documentData": { $push: "$documentData" } }});
             experienceQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });
              if (req.body.limit && req.body.skip >= 0) {
                experienceQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
              }
             experienceQuery.push({ $group: { "_id": null, "count": { "$first": "$countvalue" }, "documentData": { $push: "$documentData" } } });
//search limit
		}

		var sorting = {};
		if (req.body.sort) {
			var sorter = 'documentData.' + req.body.sort.field;
			sorting[sorter] = req.body.sort.order;
			experienceQuery.push({ $sort: sorting });
		} else {
			sorting["documentData.createdAt"] = -1;
			experienceQuery.push({ $sort: sorting });
		}

		if ((req.body.limit && req.body.skip >= 0) && !req.body.search) {
			experienceQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
		}
		//experienceQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
		  if(!req.body.search){
            experienceQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
 			}

		db.GetAggregation('experience', experienceQuery, function (err, docdata) {
			if (err) {
				res.send(err);
			} else {
				if (docdata.length != 0) {
					res.send([docdata[0].documentData, docdata[0].count]);
				} else {
					res.send([0, 0]);
				}
			}
		});
	};

	controller.delete = function (req, res) {
		req.checkBody('delData', 'Invalid delData').notEmpty();
		var errors = req.validationErrors();
		if (errors) {
			res.send(errors, 400);
			return;
		}
		db.UpdateDocument('experience', { _id: { $in: req.body.delData } }, { status: 0 }, { multi: true }, function (err, docdata) {
			if (err) {
				res.send(err);
			} else {
				res.send(docdata);
			}
		});
	};

	return controller;
};
