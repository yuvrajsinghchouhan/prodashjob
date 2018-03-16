module.exports = function () {
	var db = require('../../controller/adaptor/mongodb.js');
	var controller = {};

	controller.list = function (req, res) {

		var errors = req.validationErrors();
		if (errors) {
			res.send(errors, 400);
			return;
		}

		if (req.body.sort) {
			var sorted = req.body.sort.field;
		}


		var paymentQuery = [{
			"$match": { status: { $ne: 0 } }
		}, {
			$project: {
				gateway_name: 1,
				status: 1,
				dname: { $toLower: '$' + sorted }
			}
		}, {
			$project: {
				gateway_name: 1,
				document: "$$ROOT"
			}
		}, {
			$group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
		}];


		var condition = { status: { $ne: 0 } };
		paymentQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });

		if (req.body.search) {
			condition['gateway_name'] = { $regex: new RegExp('^' + req.body.search, 'i') };
			var searchs = req.body.search;
			paymentQuery.push({ "$match": { "documentData.gateway_name": { $regex: searchs + '.*', $options: 'si' } } });
			//search limit
			paymentQuery.push({ $group: { "_id": null, "countvalue": { "$sum": 1 }, "documentData": { $push: "$documentData" } } });
			paymentQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });
			if (req.body.limit && req.body.skip >= 0) {
				paymentQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
			}
			paymentQuery.push({ $group: { "_id": null, "count": { "$first": "$countvalue" }, "documentData": { $push: "$documentData" } } });
			//search limit
		}

		var sorting = {};
		if (req.body.sort) {
			var sorter = 'documentData.' + req.body.sort.field;
			sorting[sorter] = req.body.sort.order;
			paymentQuery.push({ $sort: sorting });
		} else {
			sorting["documentData.createdAt"] = -1;
			paymentQuery.push({ $sort: sorting });
		}

		if ((req.body.limit && req.body.skip >= 0) && !req.body.search) {
			paymentQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
		}
		//paymentQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });

		if (!req.body.search) {
			paymentQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
		}

		db.GetAggregation('paymentgateway', paymentQuery, function (err, docdata) {

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
	}

	controller.edit = function (req, res) {
		db.GetDocument('paymentgateway', { status: { $ne: 0 }, _id: req.body.id }, {}, {}, function (err, docdata) {
			if (err) {
				res.send(err);
			} else {
				res.send(docdata);
			}
		});
	}

	controller.save = function (req, res) {

		req.checkBody("alias", "Invalid Payment Gateway");
		req.checkBody("gateway_name", "Invalid Payment Gateway");
		req.checkBody("settings.mode", "Please Select the Payment Gateway Mode");

		// Stripe
		if (req.body.alias == "stripe") {
			req.checkBody("settings.secret_key", "Please enter the valid Secret Key");
			req.checkBody("settings.publishable_key", "Please enter the valid Publishable Key");
		}

		// Paypal Adaptive
		if (req.body.alias == "paypal_adaptive") {
			req.checkBody("settings.merchant_email", "Please enter the valid Merchant Email").isEmail();
			req.checkBody("settings.merchant_email_for_adaptive", "Please enter the valid Email For PayPal Adaptive");
			req.checkBody("settings.password", "Please enter the valid Password");
			req.checkBody("settings.signature", "Please enter the valid Signature");
			req.checkBody("settings.appid", "Please enter the valid APP ID");
		}

		// Paypal
		if (req.body.alias == "paypal") {
			req.checkBody("settings.client_secret", "Please enter the valid Client Secret");
			req.checkBody("settings.client_id", "Please enter the valid Client ID");
		}

		req.checkBody("status", "Invalid Payment Gateway");

		var errors = req.validationErrors();
		if (errors) {
			res.send({ errors: errors });
		} else {
			db.UpdateDocument('paymentgateway', { _id: { $in: req.body._id } }, req.body, function (err, docdata) {
				if (err) {
					res.send(err);
				} else {
					res.send(docdata);
				}
			});
		}
	}
	return controller;
}