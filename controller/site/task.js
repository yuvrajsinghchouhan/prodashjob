
var db = require('../../controller/adaptor/mongodb.js');
var async = require("async");
var mail = require('../../model/mail.js');
var mongoose = require('mongoose');
var mailcontent = require('../../model/mailcontent.js');
var CONFIG = require('../../config/config');
var moment = require('moment');
var timezone = require('moment-timezone');

module.exports = function (io) {

	var push = require('../../model/pushNotification.js')(io);

	var router = {};

	router.taskbaseinfo = function taskbaseinfo(req, res) {
		var slug = req.body.slug;
		// var VehicleStatus = 1;
		if (slug != '' && slug != '0' && typeof slug != 'undefined') {
			/*db.GetAggregation('category', [{$match: {"slug": slug,'status': 1}},
			{ $project: { SubCategoryInfo: "$$CURRENT", VehicleStatus: { $literal: VehicleStatus } } },
			{ '$lookup': { from: 'vehicle', localField: 'VehicleStatus', foreignField: 'status', as: 'Vehicle' } }
			], function (err, doc) {*/
			db.GetAggregation('category', [{ $match: { "slug": slug, 'status': 1 } },
			{ $project: { SubCategoryInfo: "$$CURRENT" } },
			{ '$lookup': { from: 'categories', localField: 'SubCategoryInfo.parent', foreignField: '_id', as: 'categorydetails' } },
			{ $unwind: { path: "$categorydetails", preserveNullAndEmptyArrays: true } }
			], function (err, doc) {
				if (err) {
					res.send(err);
				} else {
					if (!doc[0].categorydetails.marker) {
						doc[0].categorydetails.marker = './' + CONFIG.MARKER_DEFAULT_IMAGE;
					}
					res.send(doc);
				}
			});
		} else {
			res.send([]);
		}
	};

	router.taskprofileinfo = function taskprofileinfo(req, res) {
		var slug = req.body.slug;
		var options = {};
		options.populate = 'profile_details.question';
		db.GetOneDocument('tasker', { _id: req.body.slug, status: { $ne: 0 } }, {}, options, function (err, taskdata) {
			if (err || !taskdata) {
				res.send(err);
			} else {
				if (!taskdata.avatar) {
					taskdata.avatar = './' + CONFIG.USER_PROFILE_IMAGE_DEFAULT;
				}
				res.send(taskdata);
			}
		});
	};

	router.taskerreviews = function taskerreviews(req, res) {

		var getQuery = [{
			"$match": { status: { $ne: 0 }, "_id": new mongoose.Types.ObjectId(req.body.slug) }
		},
		{ $unwind: { path: "$taskerskills", preserveNullAndEmptyArrays: true } },
		{ $lookup: { from: 'categories', localField: "taskerskills.childid", foreignField: "_id", as: "taskerskills.childid" } },
		{ $unwind: { path: "$taskerskills", preserveNullAndEmptyArrays: true } },
		{ $group: { "_id": "$_id", 'taskercategory': { '$push': '$taskerskills' }, "taskerskills": { "$first": "$taskerskills" }, "createdAt": { "$first": "$createdAt" } } },
		{ $lookup: { from: 'reviews', localField: "_id", foreignField: "tasker", as: "rate" } },
		{ $unwind: { path: "$rate", preserveNullAndEmptyArrays: true } },
		{ $match: { $or: [{ "rate.type": "user" }, { rate: { $exists: false } }] } },
		{ $lookup: { from: 'users', localField: "rate.user", foreignField: "_id", as: "user" } },
		{ $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
		{ $lookup: { from: 'task', localField: "_id", foreignField: "tasker", as: "task" } },
		{ $lookup: { from: 'task', localField: "rate.task", foreignField: "_id", as: "taskcategory" } },
		{ $unwind: { path: "$taskcategory", preserveNullAndEmptyArrays: true } },
		{ $lookup: { from: 'categories', localField: "taskcategory.category", foreignField: "_id", as: "category" } },
		{
			$project: {
				rate: 1,
				user: 1,
				task: {
					$filter: {
						input: "$task",
						as: "task",
						cond: { $eq: ["$$task.status", 7] }
					}
				},
				rating: 1,
				taskcategory: 1,
				taskercategory: 1,
				category: 1,
				tasker: {
					$cond: { if: { $eq: ["$task.status", 4] }, then: "$task", else: "" }
				},
				username: 1,
				email: 1,
				role: 1,
				working_days: 1,
				location: 1,
				tasker_status: 1,
				address: 1,
				name: 1,
				avatar: 1,
				working_area: 1,
				birthdate: 1,
				availability_address: 1,
				gender: 1,
				phone: 1,
				vehicle: 1,
				taskerskills: 1,
				profile_details: 1,
				createdAt: 1
			}
		}, {
			$project: {
				name: 1,
				rate: 1,
				user: 1,
				document: "$$ROOT"
			}
		},
		{
			$group: { "_id": "$_id", "count": { "$sum": 1 }, "induvidualrating": { "$sum": "$rate.rating" }, "documentData": { $push: "$document" } }
		},
		{
			$group: {
				"_id": "$_id", "induvidualrating": { $first: "$induvidualrating" }, "avg": { $sum: { $divide: ["$induvidualrating", "$count"] } }, "documentData": { $first: "$documentData" }
			}
		}];

		db.GetAggregation('tasker', getQuery, function (err, docdata) {
			// console.log("docdata", docdata);

			if (err) {
				res.send(err);
			} else {
				if (docdata.length != 0) {

					res.send([docdata[0].documentData, docdata[0].avg]);
				} else {
					res.send([0, 0]);
				}
			}
		});
	};



	router.taskerprofile = function taskerprofile(req, res) {
		var slug = req.body.slug;
		db.GetAggregation('users', [{
			$match: {
				"_id": new mongoose.Types.ObjectId(req.body.slug)
			}
		}],
			function (err, taskdata) {
				if (err) {
					res.send(err);
				} else {
					res.send(taskdata);
				}
			});

	};



	router.gettaskuser = function gettaskuser(req, res) {
		var categoryid = req.body.categoryid;
		var user = req.body.user;
		var loginUser = req.body.loginUser;
		var vehicle = req.body.vehicle;
		var day = req.body.day;
		var hour = req.body.hour;
		var hourcondition = {};
		var responseflag = true;

		if (day != '' && day != '0' && typeof day != 'undefined' && hour != '' && hour != '0' && typeof hour != 'undefined' && objectID.isValid(categoryid) && objectID.isValid(user) && objectID.isValid(loginUser)) {
			if (hour == 'morning') {
				hourcondition = { $and: [{ $eq: ["$$working_days.day", day] }, { $eq: ["$$working_days.hour.morning", true] }] }
			} else if (hour == 'afternoon') {
				hourcondition = { $and: [{ $eq: ["$$working_days.day", day] }, { $eq: ["$$working_days.hour.afternoon", true] }] }
			} else if (hour == 'evening') {
				hourcondition = { $and: [{ $eq: ["$$working_days.day", day] }, { $eq: ["$$working_days.hour.evening", true] }] }
			} else {
				responseflag = false;
			}
			if (responseflag) {

				var condition = [];
				condition.push({ $match: { "_id": new mongoose.Types.ObjectId(user), 'status': 1 } });

				var projection = {};
				projection.userDetails = "$$CURRENT";
				projection.taskerskillsFilter = { $let: { vars: { taskerskills: { $filter: { input: "$taskerskills", as: "taskerskills", cond: { $eq: ["$$taskerskills.categoryid", new mongoose.Types.ObjectId(categoryid)] } } } }, in: { $size: "$$taskerskills" } } };

				projection.workingdaysFilter = {
					$let: {
						vars: { working_days: { $filter: { input: "$working_days", as: "working_days", cond: hourcondition } } },
						in: { $size: "$$working_days" }
					}
				};

				condition.push({ $project: projection });

				var match = { $and: [] };
				match.$and.push({ workingdaysFilter: { $gt: 0 } });
				match.$and.push({ taskerskillsFilter: { $gt: 0 } });

				match.$and.push({ _id: { $ne: new mongoose.Types.ObjectId(loginUser) } });
				condition.push({ $match: match });

				db.GetAggregation('tasker', condition, function (err, doc) {
					if (err) {
						res.send(err);
					} else {
						res.send(doc);
					}
				});

			} else {
				res.send([]);
			}
		} else {
			res.send([]);
		}
	}

	router.taskerAvailabilitybyWorkingArea = function taskerAvailabilitybyWorkingArea(req, res) {

		var taskid = req.query.task;
		var categoryid = req.query.categoryid;
		var date = req.query.date;
		var working_days = {};
		var responseflag = true;
		var hour = req.query.hour;
		var day = req.query.day;
		var startAmount = req.query.minvalue;
		var endAmount = req.query.maxvalue;
		var limit = parseInt(req.query.limit) || 6;
		var skip = parseInt(req.query.skip) || 0;

		if (hour && day) {
			var hourcondition = [];
			var hourArr = hour.split(",");
			for (var i in hourArr) {
				var val = hourArr[i];
				if (val == 'morning') {
					hourcondition.push({ $elemMatch: { "day": day, "hour.morning": true } });
				} else if (val == 'afternoon') {
					hourcondition.push({ $elemMatch: { "day": day, "hour.afternoon": true } });
				} else if (val == 'evening') {
					hourcondition.push({ $elemMatch: { "day": day, "hour.evening": true } });
				} else {
					responseflag = false;
				}
				working_days = { $all: hourcondition };
			}
		} else {
			responseflag = false;
		}
		var recentupdate = {};
		recentupdate.task_day = req.query.day;
		recentupdate.task_date = req.query.date;
		recentupdate.task_hour = req.query.hour;
		recentupdate.booking_information = {};

		if (!req.query.time) {
			req.query.time = "09:00:00"
		}
		if (responseflag) {
			async.waterfall([
				function (callback) {
					db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settingData) {
						if (err || !settingData) { data.response = 'Configure your website setting'; res.send(data); }
						else { callback(err, settingData); }
					});
				},
				function (settingData, callback) {
					var options = {};
					options.populate = 'tasker user category';
					db.GetDocument('task', { _id: new mongoose.Types.ObjectId(taskid) }, {}, { options }, function (err, taskData) {
						if (err || !taskData) { data.response = 'Unable to get taskData'; res.send(data); }
						else { callback(err, settingData, taskData); }
					});
				},
				// Count
				function (settingData, taskData, callback) {
					var taskercondition = [
						{
							"$geoNear": {
								near: { type: "Point", coordinates: [parseFloat(taskData[0].location.log), parseFloat(taskData[0].location.lat)] },
								distanceField: "distance",
								includeLocs: "location",
								query: {
									"status": 1, "availability": 1,
									"taskerskills": { $elemMatch: { childid: new mongoose.Types.ObjectId(taskData[0].category._id), status: 1 } },
									"working_days": working_days
								},
								distanceMultiplier: 0.001,
								spherical: true
							}
						},
						{
							"$redact": {
								"$cond": {
									"if": { "$lte": ["$distance", "$radius"] },
									"then": "$$KEEP",
									"else": "$$PRUNE"
								}
							}
						},
						{
							"$group":
							{
								_id: null,
								count: { $sum: 1 },
								taskers: { $push: "$$ROOT" }
							}
						}

					];
					db.GetAggregation('tasker', taskercondition, function (err, newtaskercount) {
						if (err || !newtaskercount[0]) {
							res.send({ count: 0, result: [] });
						} else {
							callback(err, settingData, newtaskercount[0].count, taskData);
						}
					});
				},
				//End count
				function (settingData, newtaskercount, taskData, callback) {
					var taskercondition = [
						{
							"$geoNear": {
								near: { type: "Point", coordinates: [parseFloat(taskData[0].location.log), parseFloat(taskData[0].location.lat)] },
								distanceField: "distance",
								includeLocs: "location",
								query: {
									"status": 1, "availability": 1,
									"taskerskills": { $elemMatch: { childid: new mongoose.Types.ObjectId(taskData[0].category._id), status: 1 } },
									"working_days": working_days
								},
								distanceMultiplier: 0.001,
								spherical: true
							}
						},
						{
							"$redact": {
								"$cond": {
									"if": { "$lte": ["$distance", "$radius"] },
									"then": "$$KEEP",
									"else": "$$PRUNE"
								}
							}
						},
						{ '$skip': skip },
						{ '$limit': limit },

						{
							"$group":
							{
								_id: null,
								count: { $sum: 1 },
								taskers: { $push: "$$ROOT" }
							}
						}

					];
					/*  taskercondition.push({ $unwind: { path: "$taskers", preserveNullAndEmptyArrays: true } });
					  if ((req.query.limit && req.query.skip >= 0) && !req.body.search) {
						  taskercondition.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
					  }*/

					db.GetAggregation('tasker', taskercondition, function (err, taskerdata) {
						console.log("err, taskerdata", err, taskerdata[0].count);
						if (err || !taskerdata[0]) {
							res.send({ count: 0, result: [] });
						} else {
							var amountData = taskerdata[0].taskers;
							// console.log("amountData",amountData.length)
							var newArray = [];
							for (var j = 0; j < amountData.length; j++) {
								for (var xx = 0; xx < amountData[j].taskerskills.length; xx++) {
									if (categoryid == amountData[j].taskerskills[xx].childid) {
										if ((startAmount <= amountData[j].taskerskills[xx].hour_rate) && (endAmount >= amountData[j].taskerskills[xx].hour_rate)) {
											newArray.push(amountData[j]);
											if (newArray[j]) {
												if (newArray[j].avatar == '' || !newArray[j].avatar) {
													newArray[j].avatar = './' + CONFIG.USER_PROFILE_IMAGE_DEFAULT;
												}
											}
										}
									}
								}
							}
							callback(err, settingData, newtaskercount, taskData, taskerdata, newArray);
						}
					});
				},
				function (settingData, newtaskercount, taskData, taskerdata, newArray, callback) {
					var formatedDate = moment(new Date(req.query.date + ' ' + req.query.time)).format('YYYY-MM-DD HH:mm:ss');
					recentupdate.booking_information.booking_date = timezone.tz(formatedDate, settingData.settings.time_zone);
					recentupdate.booking_information.service_type = taskData[0].category.name;
					recentupdate.booking_information.work_type = taskData[0].category.name;
					db.UpdateDocument('task', { _id: req.query.task }, recentupdate, function (err, docdata) {
						if (err || !docdata) { data.response = 'Unable to Put Task'; res.send(data); }
						else { callback(err, settingData, newtaskercount, taskData, taskerdata, newArray, docdata); }
					});
				},
				function (settingData, newtaskercount, taskData, taskerdata, newArray, docdata, callback) {
					var copiedData = [];
					for (var i = 0; i < taskerdata[0].taskers.length; i++) {
						copiedData.push(new mongoose.Types.ObjectId(taskerdata[0].taskers[i]._id));
					}
					var getQuery = [
						{
							"$match": { $and: [{ "tasker": { $in: copiedData } }, { status: { $eq: 7 } }] }
						},
						{
							$project: {
								tasker: 1,
								document: "$$ROOT"
							}
						},
						{
							$group: { "_id": "$tasker", "count": { "$sum": 1 }, "induvidualcount": { "$sum": 1 }, "documentData": { $push: "$document" } }
						},
						{
							$group: {
								"_id": "$_id", "induvidualcount": { $first: "$induvidualcount" }, "datacount": { $sum: "$count" }, "documentData": { $first: "$documentData" }
							}
						}



					];
					db.GetAggregation('task', getQuery, function (err, documentData) {
						if (err) {
							res.send(err);
						} else {
							callback(err, settingData, newtaskercount, taskData, taskerdata, newArray, docdata, documentData);
						}
					});

				},
				function (settingData, newtaskercount, taskData, taskerdata, newArray, docdata, documentData, callback) {
					var copiedData = [];
					for (var i = 0; i < taskerdata[0].taskers.length; i++) {
						copiedData.push(new mongoose.Types.ObjectId(taskerdata[0].taskers[i]._id));
					}
					var getQuery = [
						{
							"$match": { "tasker": { $in: copiedData }, type: "user" }
						},
						{
							$unwind: { path: "$copiedData", preserveNullAndEmptyArrays: true }
						},
						{
							$lookup: { from: 'users', localField: "user", foreignField: "_id", as: "userdetails" }
						},
						{
							$unwind: { path: "$userdetails", preserveNullAndEmptyArrays: true }
						},

						{
							$lookup: { from: 'task', localField: "task", foreignField: "_id", as: "taskdetail" }
						},
						{
							$unwind: { path: "$taskdetail", preserveNullAndEmptyArrays: true }
						},
						{
							"$match": { "taskdetail.status": { $eq: 7 }, "taskdetail.invoice.status": { $eq: 1 } }
						},

						{
							$project: {
								comments: 1,
								rating: 1,
								tasker: 1,
								userdetails: 1,
								document: "$$ROOT"
							}
						},
						{
							$group: { "_id": "$tasker", "count": { "$sum": 1 }, "induvidualrating": { "$sum": "$rating" }, "documentData": { $push: "$document" } }
						},
						{
							$group: {
								"_id": "$_id", "induvidualrating": { $first: "$induvidualrating" }, "avg": { $sum: { $divide: ["$induvidualrating", "$count"] } }, "datacount": { $sum: "$count" }, "documentData": { $first: "$documentData" }
							}
						}

					];
					db.GetAggregation('review', getQuery, function (err, avgratingdata) {
						if (err) {
							res.send(err);
						} else {
							if (avgratingdata.length) {
								if (avgratingdata[0].documentData) {
									for (var i = 0; i < avgratingdata[0].documentData.length; i++) {
										if (avgratingdata[0].documentData[i].userdetails.avatar == '' || !avgratingdata[0].documentData[i].userdetails.avatar) {
											avgratingdata[0].documentData[i].userdetails.avatar = './' + CONFIG.USER_PROFILE_IMAGE_DEFAULT;
										}
									}
								}
							}
							callback(err, settingData, newtaskercount, taskData, docdata, taskerdata, newArray, documentData, avgratingdata);
						}
					});
				}
			], function (err, settingData, newtaskercount, taskData, docdata, taskerdata, newArray, documentData, avgratingdata) {
				if (err) {
					res.send(err);
				} else {
					res.send({ count: taskerdata[0].count, result: newArray, avgrating: avgratingdata, taskercount: documentData, countall: newtaskercount });
				}
			});
		}
		else {
			res.send({ count: 0, result: [] });
		}
	}

	// 											---------------- Map ----------------------
	router.taskerAvailabilitybyWorkingAreaMap = function taskerAvailabilitybyWorkingAreaMap(req, res) {

		var taskid = req.query.task;
		var categoryid = req.query.categoryid;
		var date = req.query.date;
		var working_days = {};
		var responseflag = true;
		var hour = req.query.hour;
		var day = req.query.day;
		var startAmount = req.query.minvalue;
		var endAmount = req.query.maxvalue;
		// var limit = parseInt(req.query.limit) || 5;
		// var skip = parseInt(req.query.skip) || 0;

		if (hour && day) {
			var hourcondition = [];
			var hourArr = hour.split(",");
			for (var i in hourArr) {
				var val = hourArr[i];
				if (val == 'morning') {
					hourcondition.push({ $elemMatch: { "day": day, "hour.morning": true } });
				} else if (val == 'afternoon') {
					hourcondition.push({ $elemMatch: { "day": day, "hour.afternoon": true } });
				} else if (val == 'evening') {
					hourcondition.push({ $elemMatch: { "day": day, "hour.evening": true } });
				} else {
					responseflag = false;
				}
				working_days = { $all: hourcondition };
			}
		} else {
			responseflag = false;
		}
		var recentupdate = {};
		recentupdate.task_day = req.query.day;
		recentupdate.task_date = req.query.date;
		recentupdate.task_hour = req.query.hour;
		recentupdate.booking_information = {};

		if (!req.query.time) {
			req.query.time = "09:00:00"
		}
		if (responseflag) {
			async.waterfall([
				function (callback) {
					db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settingData) {
						if (err || !settingData) { data.response = 'Configure your website setting'; res.send(data); }
						else { callback(err, settingData); }
					});
				},
				function (settingData, callback) {
					var options = {};
					options.populate = 'tasker user category';
					db.GetDocument('task', { _id: new mongoose.Types.ObjectId(taskid) }, {}, { options }, function (err, taskData) {
						if (err || !taskData) { data.response = 'Unable to get taskData'; res.send(data); }
						else { callback(err, settingData, taskData); }
					});
				},
				function (settingData, taskData, callback) {
					var taskercondition = [
						{
							"$geoNear": {
								near: { type: "Point", coordinates: [parseFloat(taskData[0].location.log), parseFloat(taskData[0].location.lat)] },
								distanceField: "distance",
								includeLocs: "location",
								query: {
									"status": 1, "availability": 1,
									"taskerskills": { $elemMatch: { childid: new mongoose.Types.ObjectId(taskData[0].category._id), status: 1 } },
									"working_days": working_days
								},
								distanceMultiplier: 0.001,
								spherical: true
							}
						},
						{
							"$redact": {
								"$cond": {
									"if": { "$lte": ["$distance", "$radius"] },
									"then": "$$KEEP",
									"else": "$$PRUNE"
								}
							}
						},
						// { '$skip': skip },
						// { '$limit': limit },
						{
							"$group":
							{
								_id: null,
								count: { $sum: 1 },
								taskers: { $push: "$$ROOT" }
							}
						}

					];
					db.GetAggregation('tasker', taskercondition, function (err, taskerdata) {
						if (err || !taskerdata[0]) {
							res.send({ count: 0, result: [] });
						} else {
							var amountData = taskerdata[0].taskers;
							// console.log("amountData",amountData.length)
							var newArray = [];
							for (var j = 0; j < amountData.length; j++) {
								for (var xx = 0; xx < amountData[j].taskerskills.length; xx++) {
									if (categoryid == amountData[j].taskerskills[xx].childid) {
										if ((startAmount <= amountData[j].taskerskills[xx].hour_rate) && (endAmount >= amountData[j].taskerskills[xx].hour_rate)) {
											newArray.push(amountData[j]);
											if (newArray[j]) {
												if (newArray[j].avatar == '' || !newArray[j].avatar) {
													newArray[j].avatar = './' + CONFIG.USER_PROFILE_IMAGE_DEFAULT;
												}
											}
										}
									}
								}
							}
							callback(err, settingData, taskData, taskerdata, newArray);
						}
					});
				},
				function (settingData, taskData, taskerdata, newArray, callback) {
					var formatedDate = moment(new Date(req.query.date + ' ' + req.query.time)).format('YYYY-MM-DD HH:mm:ss');
					recentupdate.booking_information.booking_date = timezone.tz(formatedDate, settingData.settings.time_zone);
					recentupdate.booking_information.service_type = taskData[0].category.name;
					recentupdate.booking_information.work_type = taskData[0].category.name;
					db.UpdateDocument('task', { _id: req.query.task }, recentupdate, function (err, docdata) {
						if (err || !docdata) { data.response = 'Unable to Put Task'; res.send(data); }
						else { callback(err, settingData, taskData, taskerdata, newArray, docdata); }
					});
				},
				function (settingData, taskData, taskerdata, newArray, docdata, callback) {
					var copiedData = [];
					for (var i = 0; i < taskerdata[0].taskers.length; i++) {
						copiedData.push(new mongoose.Types.ObjectId(taskerdata[0].taskers[i]._id));
					}
					var getQuery = [
						{
							"$match": { $and: [{ "tasker": { $in: copiedData } }, { status: { $eq: 7 } }] }
						},
						{
							$project: {
								tasker: 1,
								document: "$$ROOT"
							}
						},
						{
							$group: { "_id": "$tasker", "count": { "$sum": 1 }, "induvidualcount": { "$sum": 1 }, "documentData": { $push: "$document" } }
						},
						{
							$group: {
								"_id": "$_id", "induvidualcount": { $first: "$induvidualcount" }, "datacount": { $sum: "$count" }, "documentData": { $first: "$documentData" }
							}
						}



					];
					db.GetAggregation('task', getQuery, function (err, documentData) {
						if (err) {
							res.send(err);
						} else {
							callback(err, settingData, taskData, taskerdata, newArray, docdata, documentData);
						}
					});

				},
				function (settingData, taskData, taskerdata, newArray, docdata, documentData, callback) {
					var copiedData = [];
					for (var i = 0; i < taskerdata[0].taskers.length; i++) {
						copiedData.push(new mongoose.Types.ObjectId(taskerdata[0].taskers[i]._id));
					}
					var getQuery = [
						{
							"$match": { "tasker": { $in: copiedData }, type: "user" }
						},
						{
							$unwind: { path: "$copiedData", preserveNullAndEmptyArrays: true }
						},
						{
							$lookup: { from: 'users', localField: "user", foreignField: "_id", as: "userdetails" }
						},
						{
							$unwind: { path: "$userdetails", preserveNullAndEmptyArrays: true }
						},

						{
							$lookup: { from: 'task', localField: "task", foreignField: "_id", as: "taskdetail" }
						},
						{
							$unwind: { path: "$taskdetail", preserveNullAndEmptyArrays: true }
						},
						{
							"$match": { "taskdetail.status": { $eq: 7 }, "taskdetail.invoice.status": { $eq: 1 } }
						},

						{
							$project: {
								comments: 1,
								rating: 1,
								tasker: 1,
								userdetails: 1,
								document: "$$ROOT"
							}
						},
						{
							$group: { "_id": "$tasker", "count": { "$sum": 1 }, "induvidualrating": { "$sum": "$rating" }, "documentData": { $push: "$document" } }
						},
						{
							$group: {
								"_id": "$_id", "induvidualrating": { $first: "$induvidualrating" }, "avg": { $sum: { $divide: ["$induvidualrating", "$count"] } }, "datacount": { $sum: "$count" }, "documentData": { $first: "$documentData" }
							}
						}

					];
					db.GetAggregation('review', getQuery, function (err, avgratingdata) {
						if (err) {
							res.send(err);
						} else {
							if (avgratingdata.length) {
								if (avgratingdata[0].documentData) {
									for (var i = 0; i < avgratingdata[0].documentData.length; i++) {
										if (avgratingdata[0].documentData[i].userdetails.avatar == '' || !avgratingdata[0].documentData[i].userdetails.avatar) {
											avgratingdata[0].documentData[i].userdetails.avatar = './' + CONFIG.USER_PROFILE_IMAGE_DEFAULT;
										}
									}
								}
							}
							callback(err, settingData, taskData, docdata, taskerdata, newArray, documentData, avgratingdata);
						}
					});
				}
			], function (err, settingData, taskData, docdata, taskerdata, newArray, documentData, avgratingdata) {
				if (err) {
					res.send(err);
				} else {
					res.send({ count: taskerdata[0].count, result: newArray, avgrating: avgratingdata, taskercount: documentData });
				}
			});
		}
		else {
			res.send({ count: 0, result: [] });
		}

	}



	router.taskerAvailabilitybyWorkingAreaCount = function taskerAvailabilitybyWorkingAreaCount(req, res) {
		var pickup_lat = req.query.lat;
		var pickup_lon = req.query.lon;
		var categoryid = req.query.categoryid;
		var condition = { status: 1, availability: 1 };
		var hour = req.query.hour;
		var day = req.query.day;
		var taskercondition = [
			{
				"$geoNear": {
					near: { type: "Point", coordinates: [parseFloat(pickup_lon), parseFloat(pickup_lat)] },
					distanceField: "distance",
					includeLocs: "location",
					query: {
						"status": 1, "availability": 1,
						"taskerskills": { $elemMatch: { childid: new mongoose.Types.ObjectId(categoryid), status: 1 } },
					},
					distanceMultiplier: 0.001,
					spherical: true
				}
			},
			{
				"$redact": {
					"$cond": {
						"if": { "$lte": ["$distance", "$radius"] },
						"then": "$$KEEP",
						"else": "$$PRUNE"
					}
				}
			},

			{
				"$group":
				{
					_id: null,
					count: { $sum: 1 },
					taskers: { $push: "$$ROOT" }
				}
			}

		];
		db.GetAggregation('tasker', taskercondition, function (err, docdata) {
			if (err || docdata.length == 0) {
				res.send(err);
			} else {
				res.send({ count: docdata[0].count });
			}
		});
	}


	router.getaddressdata = function getaddressdata(req, res) {
		db.GetDocument('users', { '_id': req.body.userid }, {}, {}, function (addErr, addRespo) {
			if (addErr || addRespo.length == 0) {
				res.send({
					"status": "0",
					"response": "address not updated"
				});
			} else {
				for (var i = 0; i < addRespo[0].addressList.length; i++) {
					if (i == req.body.id) {
						res.send(addRespo[0].addressList[i]);
					}
				}
			}
		});
	};

	router.getuserdata = function getuserdata(req, res) {
		db.GetDocument('users', { '_id': req.body.data.user }, {}, {}, function (addErr, userrespo) {
			if (addErr || userrespo.length == 0) {
				res.send(err);
			} else {

				if (!userrespo[0].avatar) {
					userrespo[0].avatar = './' + CONFIG.USER_PROFILE_IMAGE_DEFAULT;
				}
				res.send(userrespo);

			}
		});
	}


	router.addressStatus = function (req, res) {
		db.UpdateDocument('users', { '_id': req.body.userid, 'addressList.status': 3 }, { "addressList.$.status": 1 }, { multi: true }, function (err, docdata) {
			if (err) {
				res.send(err);
			} else {
				db.UpdateDocument('users', { '_id': req.body.userid, 'addressList._id': req.body.add_id }, { "addressList.$.status": 3 }, {}, function (err, docdata) {
					if (err) {
						res.send(err);
					} else {
						res.send(docdata);
					}
				});
			}
		});
	};

	router.deleteaddress = function deleteaddress(req, res) {

		db.GetDocument('users', { '_id': req.body.userid }, {}, {}, function (addErr, addRespo) {
			if (addErr || addRespo.length == 0) {
				res.send({
					"status": "0",
					"response": "address not updated"
				});
			} else {
				addRespo[0].addressList.splice(parseInt(req.body.id), 1);

				db.UpdateDocument('users', { _id: req.body.userid }, addRespo[0], { multi: true }, function (addUErr, addURespo) {
					if (addUErr) {
						res.send({
							"status": "0",
							"response": "address not updated"
						});
					} else {

						res.send(addURespo);
					}

				});

			}
		});

	};
	router.addaddress = function addaddress(req, res) {
		db.GetOneDocument('users', { '_id': req.body.userid, addressList: { $elemMatch: { "location.lng": req.body.data.addressList.location.lng, "location.lat": req.body.data.addressList.location.lat } } }, {}, {}, function (addErr, addRespo) {
			if (addErr || addRespo) {
				res.send({ status: 0, message: 'Address already added on the list' });
			} else {
				var address = {
					'line1': req.body.data.editaddressdata.line1 || "",
					'country': req.body.data.editaddressdata.country || "",
					'street': req.body.data.editaddressdata.street || "",
					'landmark': req.body.data.editaddressdata.landmark || "",
					'state': req.body.data.editaddressdata.state || "",
					'status': req.body.data.editaddressdata.status || 1,
					'city': req.body.data.editaddressdata.city || "",
					'zipcode': req.body.data.editaddressdata.zipcode || "",
					'location': req.body.data.addressList.location || ""
				};
				if (req.body.data.editaddressdata._id) {
					if (req.body.data.addressList.location.lng == '' || req.body.data.addressList.location.lat == '') {
						db.UpdateDocument('users', { _id: req.body.userid, 'addressList._id': req.body.data.editaddressdata._id },
							{
								"addressList.$.line1": req.body.data.editaddressdata.line1, "addressList.$.country": req.body.data.editaddressdata.country, "addressList.$.street": req.body.data.editaddressdata.street,
								"addressList.$.city": req.body.data.editaddressdata.city, "addressList.$.landmark": req.body.data.editaddressdata.landmark, "addressList.$.status": req.body.data.editaddressdata.status, "addressList.$.state": req.body.data.editaddressdata.state, "addressList.$.locality": req.body.data.editaddressdata.locality,
								"addressList.$.zipcode": req.body.data.editaddressdata.zipcode
							}, {}, function (err, docdata) {

								if (err) {
									res.send(err);
								} else {
									res.send(docdata);
								}
							});
					} else {
						db.UpdateDocument('users', { _id: req.body.userid, 'addressList._id': req.body.data.editaddressdata._id },
							{
								"addressList.$.line1": req.body.data.editaddressdata.line1, "addressList.$.country": req.body.data.editaddressdata.country, "addressList.$.street": req.body.data.editaddressdata.street,
								"addressList.$.city": req.body.data.editaddressdata.city, "addressList.$.landmark": req.body.data.editaddressdata.landmark, "addressList.$.status": req.body.data.editaddressdata.status, "addressList.$.locality": req.body.data.editaddressdata.locality,
								"addressList.$.zipcode": req.body.data.editaddressdata.zipcode, "addressList.$.location.lat": req.body.data.addressList.location.lat, "addressList.$.location.lng": req.body.data.addressList.location.lng
							}, { multi: true }, function (err, docdata) {

								if (err) {
									res.send(err);
								} else {
									res.send(docdata);
								}
							});
					}
				} else {
					db.UpdateDocument('users', { _id: req.body.userid }, { "$push": { 'addressList': address } }, {}, function (err, docdata) {

						if (err) {
							res.send(err);
						} else {
							res.send(docdata);
						}
					});
				}
			}

		});
	};

	router.addnewtask = function addnewtask(req, res) {
		var data = {};
		data.category = req.body.categoryid;
		data.address = req.body.address;
		data.billing_address = req.body.billing_address;
		data.task_address = req.body.task_address;
		data.user = req.body.userid;
		data.task_description = req.body.task_description;
		data.location = req.body.location
		data.status = 10;
		data.payee_status = 0;
		db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settingdata) {
			if (err || !settingdata) {
				res.send(err);
			} else {
				if (settingdata.settings.bookingIdPrefix) {
					data.booking_id = settingdata.settings.bookingIdPrefix + '-' + Math.floor(100000 + Math.random() * 900000);
					db.InsertDocument('task', data, function (err, docdata) {
						if (err) {
							res.send(err);
						} else {
							res.send(docdata);
						}
					});
				} else {
					res.send("Task Prefix code is not available in BackEnd");
				}
			}
		});
	};



	router.gettaskdetailsbyid = function gettaskdetailsbyid(req, res) {
		var data = {};
		data.taskid = req.body.id;
		var options = {};
		options.populate = 'category user tasker';
		db.GetDocument('task', { _id: req.body.id }, {}, options, function (err, taskdata) {
			if (err) {
				res.send(err);
			} else {
				res.send(taskdata[0]);
			}
		});
	};

	router.searchTasker = function searchTasker(req, res) {

		var taskId = req.body.task;
		var options = {};
		options.populate = 'user category';
		db.GetOneDocument('task', { _id: taskId }, {}, options, function (err, task) {
			if (err || !task) {
				res.send(err);
			} else {
				var taskercondition = [
					{
						"$geoNear": {
							near: { type: "Point", coordinates: [parseFloat(task.location.log), parseFloat(task.location.lat)] },
							distanceField: "distance",
							includeLocs: "location",
							query: {
								"status": 1, "availability": 1,
								"taskerskills": { $elemMatch: { childid: new mongoose.Types.ObjectId(task.category._id), status: 1 } },
							},
							distanceMultiplier: 0.001,
							spherical: true
						}
					},
					{
						"$redact": {
							"$cond": {
								"if": { "$lte": ["$distance", "$radius"] },
								"then": "$$KEEP",
								"else": "$$PRUNE"
							}
						}
					},
					{ $unwind: '$taskerskills' },
					{ $match: { 'taskerskills.childid': new mongoose.Types.ObjectId(task.category._id) } },
					{
						"$group":
						{
							_id: null,
							maxRate: { $max: "$taskerskills.hour_rate" },
							minRate: { $min: "$taskerskills.hour_rate" }
						}
					}
				];
				db.GetAggregation('tasker', taskercondition, function (err, docdata) {
					if (err || docdata.length <= 0) {
						res.send(err);
					} else {
						res.send(docdata[0]);
					}
				});
			}
		});
	};

	router.confirmtask = function confirmtask(req, res) {
		data = req.body.data;
		db.GetOneDocument('settings', { 'alias': 'general' }, {}, {}, function (err, settingdata) {
			if (err || !settingdata) {
				res.send(err);
			} else {
				db.GetDocument('task', { _id: req.body.data._id }, { booking_information: 1 }, {}, function (err, dateDate) {
					if (err) {
						res.send(err);
					} else {
						data.booking_information.booking_date = dateDate[0].booking_information.booking_date;
						db.UpdateDocument('task', { _id: req.body.data._id }, data, {}, function (err, docdata) {
							if (err) {
								res.send(err);
							} else {
								var options = {};
								options.populate = 'user tasker category';
								db.GetDocument('task', { _id: req.body.data._id }, {}, options, function (err, taskdata) {
									if (err) {
										res.send(err);
									} else {
										db.GetOneDocument('category', { _id: taskdata[0].category.parent }, {}, options, function (err, category) {
											if (err) {
												res.send(err);
											} else {
												// console.log("category", category);
												var job_date = timezone.tz(taskdata[0].booking_information.booking_date, settingdata.settings.time_zone).format(settingdata.settings.date_format);
												var job_time = timezone.tz(taskdata[0].booking_information.booking_date, settingdata.settings.time_zone).format(settingdata.settings.time_format);
												var mailcredentials = {};
												mailcredentials.taskname = category.name + " (" + req.body.data.category.name + ")";
												mailcredentials.username = taskdata[0].user.username;
												mailcredentials.taskername = taskdata[0].tasker.username;
												mailcredentials.taskeremail = taskdata[0].tasker.email;
												mailcredentials.useremail = taskdata[0].user.email;
												mailcredentials.bookingid = taskdata[0].booking_id;
												mailcredentials.taskdate = job_date;
												mailcredentials.taskhour = job_time;
												mailcredentials.taskdescription = req.body.data.task_description;
												var username;
												var taskername;
												if (taskdata[0].tasker.name) {
													taskername = taskdata[0].tasker.name.first_name + " (" + taskdata[0].tasker.username + ")";
												} else { taskername = taskdata[0].tasker.username; }
												if (taskdata[0].user.name) {
													username = taskdata[0].user.name.first_name + " (" + taskdata[0].user.username + ")";
												} else { username = taskdata[0].user.username; }
												var mailData = {};
												mailData.template = 'Taskpendingapproval';
												mailData.to = mailcredentials.useremail;
												mailData.html = [];
												mailData.html.push({ name: 'username', value: username });
												mailData.html.push({ name: 'taskername', value: taskername });
												mailData.html.push({ name: 'taskname', value: mailcredentials.taskname });
												mailData.html.push({ name: 'bookingid', value: mailcredentials.bookingid });
												mailData.html.push({ name: 'startdate', value: mailcredentials.taskdate });
												mailData.html.push({ name: 'workingtime', value: mailcredentials.taskhour });
												mailData.html.push({ name: 'description', value: mailcredentials.taskdescription });
												mailData.html.push({ name: 'site_url', value: settingdata.settings.site_url });
												mailData.html.push({ name: 'site_title', value: settingdata.settings.site_title });
												mailData.html.push({ name: 'logo', value: settingdata.settings.logo });
												mailcontent.sendmail(mailData, function (err, response) { });
												var mailData1 = {};
												mailData1.template = 'Quickrabbitconfirmtask';
												mailData1.to = mailcredentials.taskeremail;
												mailData1.html = [];
												mailData1.html.push({ name: 'username', value: username });
												mailData1.html.push({ name: 'taskername', value: taskername });
												mailData1.html.push({ name: 'taskname', value: mailcredentials.taskname });
												mailData1.html.push({ name: 'bookingid', value: mailcredentials.bookingid });
												mailData1.html.push({ name: 'startdate', value: mailcredentials.taskdate });
												mailData1.html.push({ name: 'workingtime', value: mailcredentials.taskhour });
												mailData1.html.push({ name: 'description', value: mailcredentials.taskdescription });
												mailData1.html.push({ name: 'site_url', value: settingdata.settings.site_url });
												mailData1.html.push({ name: 'site_title', value: settingdata.settings.site_title });
												mailData1.html.push({ name: 'logo', value: settingdata.settings.logo });
												mailcontent.sendmail(mailData1, function (err, response) { });
												var mailData2 = {};
												mailData2.template = 'Newtaskregister';
												mailData2.to = settingdata.settings.email_address;
												mailData2.html = [];
												mailData2.html.push({ name: 'username', value: username });
												mailData2.html.push({ name: 'taskername', value: taskername });
												mailData2.html.push({ name: 'taskname', value: mailcredentials.taskname });
												mailData2.html.push({ name: 'bookingid', value: mailcredentials.bookingid });
												mailData2.html.push({ name: 'startdate', value: mailcredentials.taskdate });
												mailData2.html.push({ name: 'workingtime', value: mailcredentials.taskhour });
												mailData2.html.push({ name: 'description', value: mailcredentials.taskdescription });
												mailData2.html.push({ name: 'site_url', value: settingdata.settings.site_url });
												mailData2.html.push({ name: 'site_title', value: settingdata.settings.site_title });
												mailData2.html.push({ name: 'logo', value: settingdata.settings.logo });
												mailcontent.sendmail(mailData2, function (err, response) { });
												if (data.status == 1) {
													var notifications = { 'job_id': taskdata[0].booking_id, 'user_id': taskdata[0].tasker._id };
													var message = CONFIG.NOTIFICATION.REQUEST_FOR_A_JOB;
													push.sendPushnotification(taskdata[0].tasker._id, message, 'job_request', 'ANDROID', notifications, 'PROVIDER', function (err, response, body) { });
													res.send(taskdata[0]);
												}
												else {
													var notifications = { 'job_id': taskdata[0].booking_id, 'user_id': taskdata[0].user._id };
													var message = CONFIG.NOTIFICATION.YOUR_JOB_IS_ACCEPTED;
													push.sendPushnotification(taskdata[0].user._id, message, 'job_accepted', 'ANDROID', notifications, 'USER', function (err, response, body) { });
													res.send(taskdata[0]);
												}
											}
										});
									}
								});
							}
						});
					}
				});
			}
		});
	};

	router.taskerCount = function taskerCount(req, res) {
		var taskid = req.query.task;
		var categoryname = req.query.categoryname;
		var limit = parseInt(req.query.limit) || 2;
		var skip = parseInt(req.query.skip) || 0;
		db.GetOneDocument('task', { _id: new mongoose.Types.ObjectId(taskid) }, {}, {}, function (err, taskDataaa) {
			if (err || !taskDataaa) {
				res.send(err);
			} else {
				var taskercondition = [
					{
						"$geoNear": {
							near: { type: "Point", coordinates: [parseFloat(taskDataaa.location.log), parseFloat(taskDataaa.location.lat)] },
							distanceField: "distance",
							includeLocs: "location",
							query: {
								"status": 1, "availability": 1,
								"taskerskills": { $elemMatch: { childid: new mongoose.Types.ObjectId(taskDataaa.category), status: 1 } }
							},
							distanceMultiplier: 0.001,
							spherical: true
						}
					},
					{
						"$redact": {
							"$cond": {
								"if": { "$lte": ["$distance", "$radius"] },
								"then": "$$KEEP",
								"else": "$$PRUNE"
							}
						}
					},
					{ '$skip': skip },
					{ '$limit': limit },
					{
						"$group":
						{
							_id: null,
							count: { $sum: 1 },
							taskers: { $push: "$$ROOT" }
						}
					}
				];
				db.GetAggregation('tasker', taskercondition, function (err, docdata) {
					// console.log("docdata",docdata)
					if (err || !docdata[0]) {
						res.send({ count: 0, result: [] });
					} else {
						res.send({ count: docdata[0].count });

					}
				});
			}
		});
	};
	return router;
};
