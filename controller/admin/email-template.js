"use strict";

module.exports = function (io) {

	var mongoose = require('mongoose');
	var db = require('../../controller/adaptor/mongodb.js');

	var controller = {};

	controller.list = function (req, res) {
		/*console.log(">>>>>>>>>req.body>>>>>>>>>>>>>>>>>>")
		console.log(req.body)
		console.log(">>>>>>>>>req.body>>>>>>>>>>>>>>>>>>")*/
		var errors = req.validationErrors();
		if (errors) {
			res.send(errors, 400);
			return;
		}
		if (req.body.sort) {
			var sorted = req.body.sort.field;
		}
		var emailQuery = [{
			"$match": { status: { $ne: 0 } }
		}, {
			$project: {
				name: 1,
				email_subject: 1,
				sender_email: 1,
				dname: { $toLower: '$' + sorted }
			}
		}, {
			$project: {
				name: 1,
				document: "$$ROOT"
			}
		}, {
			$group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
		}];
		var condition = { status: { $ne: 0 } };
		emailQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });
		if (req.body.search) {
			condition['name'] = { $regex: new RegExp('^' + req.body.search, 'i') };
			var searchs = req.body.search;
			emailQuery.push({
				"$match": {
					$or: [
						{ "documentData.name": { $regex: searchs + '.*', $options: 'si' } },
						{ "documentData.sender_email": { $regex: searchs + '.*', $options: 'si' } },
						{ "documentData.email_subject": { $regex: searchs + '.*', $options: 'si' } }
					]
				}
			});
			//search limit
			emailQuery.push({ $group: { "_id": null, "countvalue": { "$sum": 1 }, "documentData": { $push: "$documentData" } } });
			emailQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });
			if (req.body.limit && req.body.skip >= 0) {
				emailQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
			}
			emailQuery.push({ $group: { "_id": null, "count": { "$first": "$countvalue" }, "documentData": { $push: "$documentData" } } });
			//search limit
		}
		var sorting = {};
		if (req.body.sort) {
			var sorter = 'documentData.' + req.body.sort.field;
			sorting[sorter] = req.body.sort.order;
			emailQuery.push({ $sort: sorting });
		} else {
			sorting["documentData.createdAt"] = -1;
			emailQuery.push({ $sort: sorting });
		}
		if ((req.body.limit && req.body.skip >= 0) && !req.body.search) {
			emailQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
		}
		//emailQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
		if (!req.body.search) {
			emailQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
		}

		console.log('>>>>>>>>>>>emailQuery>>>>>>>>>>>')
		console.log(emailQuery)
		console.log('>>>>>>>>>>emailQuery>>>>>>>>>>>>')

		db.GetAggregation('emailtemplate', emailQuery, function (err, docdata) {
			// console.log(docdata[0].documentData)
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

	controller.edit = function (req, res) {
		db.GetOneDocument('emailtemplate', { _id: req.body.id }, {}, {}, function (err, docdata) {
			if (err) {
				res.send(err);
			} else {
				res.send(docdata);
			}
		});
	};

	controller.save = function (req, res) {
		req.checkBody('name', 'Please enter template name').notEmpty();
		req.checkBody('email_subject', 'Please enter email subject').notEmpty();
		req.checkBody('email_content', 'Please enter email content').notEmpty();
		//req.body.status = 1;
		var errors = req.validationErrors();
		if (errors) {
			res.status(400).send(errors[0].msg);
			return;
		} else {
			if (req.body._id) {
				db.UpdateDocument('emailtemplate', { _id: req.body._id }, req.body, function (err, docdata) {
					if (err) {
						res.send(err);
					} else {
						res.send(docdata);
					}
				});
			} else {
				db.InsertDocument('emailtemplate', req.body, function (err, result) {
					if (err) {
						res.send(err);
					} else {
						res.send(result);
					}
				});
			}
		}
	};

	controller.delete = function (req, res) {
		req.checkBody('delData', 'Invalid delData').notEmpty();
		var errors = req.validationErrors();
		if (errors) {
			res.send(errors, 400);
			return;
		}

		db.UpdateDocument('emailtemplate', { _id: { $in: req.body.delData } }, { status: 0 }, { multi: true }, function (err, docdata) {
			if (err) {
				res.send(err);
			} else {
				res.send(docdata);
			}
		});
	};

	controller.getsubscripermail = function (req, res) {
		db.GetDocument('emailtemplate', { 'subscription': 1, status: { $ne: 0 } }, {}, {}, function (err, docdata) {
			if (err) {
				res.send(err);
			} else {
				res.send(docdata);
			}
		});
	};


	/*	controller.channgedetails = function (req, res) {
			db.UpdateDocument('emailtemplate', { status: { $ne: 0 } }, {'sender_email': 'maidacapi@gmail.com'}, {multi:true}, function (err, docdata) {
				if (err) {
					res.send(err);
				} else {
				  res.send(docdata);
				}
			});
		};*/

	return controller;
}
