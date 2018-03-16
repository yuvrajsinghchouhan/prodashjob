"use strict";

module.exports = function () {
	var mongoose = require('mongoose');
	var db = require('../../controller/adaptor/mongodb.js');
	var attachment = require('../../model/attachments.js');
	var json2csv = require('json2csv');
	var fs = require('fs');

	var controller = {};


	controller.taskexport = function (req, res) {
		var bannerQuery = [{
			"$match": { status: { $ne: 0 } }
		}, {
				$lookup:
				{
					from: "categories",
					localField: "category",
					foreignField: "_id",
					as: "category"
				}
			}, {
				$lookup:
				{
					from: "tasker",
					localField: "tasker",
					foreignField: "_id",
					as: "tasker"
				}
			}, {
				$lookup:
				{
					from: "users",
					localField: "user",
					foreignField: "_id",
					as: "user"
				}
			},
			{
				$project: {
					tasker: 1,
					category: 1,
					user: 1,
					billing_address: 1,
					status: 1,
					amount: 1,
					task_date: 1,
					task_hour: 1,
					admin_commission_percentage: 1,
					payment_mode: 1,
					tasker_amount: 1,
				}
			}, {
				$project: {
					//question: 1,
					document: "$$ROOT"
				}
			}, {
				$group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
			}];
		db.GetAggregation('task', bannerQuery, function (err, docdata) {
			if (err) {
				res.send(err);
			} else {
				if (docdata.length != 0) {
					var fields = ['user[0].username', 'tasker[0].username', 'category[0].name', 'billing_address.country', 'billing_address.state', 'billing_address.city', 'billing_address.zipcode', 'amount', 'task_date', 'task_hour', 'admin_commission_percentage', 'payment_mode', 'tasker_amount.admin_commission', 'tasker_amount.tasker_commission'];
					var fieldNames = ['User Name', 'Tasker Name', 'Category', 'Country', 'State', 'City', 'Zipcode', 'Amount', 'Task Date', 'Task Hour', 'Admin Commission Percentage', 'Payment Mode', 'Admin Commission', 'Tasker Commission'];
					var mydata = docdata[0].documentData;
					json2csv({ data: mydata, fields: fields, fieldNames: fieldNames }, function (err, csv) {
						if (err);

						var filename = 'uploads/csv/tasks-' + new Date().getTime() + '.csv';
						fs.writeFile(filename, csv, function (err) {
							if (err) throw err;
							res.download(filename);
						});
					});
				} else {
					res.send([0, 0]);
				}
			}
		});
	}

	controller.taskexportpost = function (req, res) {
		var bannerQuery = [{
			"$match": { status: { $ne: 0 } }
		}, {
				$lookup:
				{
					from: "categories",
					localField: "category",
					foreignField: "_id",
					as: "category"
				}
			}, {
				$lookup:
				{
					from: "tasker",
					localField: "tasker",
					foreignField: "_id",
					as: "tasker"
				}
			}, {
				$lookup:
				{
					from: "users",
					localField: "user",
					foreignField: "_id",
					as: "user"
				}
			},
			{
				$project: {
					tasker: 1,
					category: 1,
					user: 1,
					billing_address: 1,
					status: 1,
					amount: 1,
					task_date: 1,
					task_hour: 1,
					admin_commission_percentage: 1,
					payment_mode: 1,
					tasker_amount: 1,
				}
			}, {
				$project: {
					//question: 1,
					document: "$$ROOT"
				}
			}, {
				$group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
			}];
		db.GetAggregation('task', bannerQuery, function (err, docdata) {
			if (err || docdata.length == 0) {
				res.send({ error: 'No Data' });
			} else {
				res.send(docdata);
			}
		});
	}

	controller.userexport = function (req, res) {
		var bannerQuery = [{
			"$match": { status: { $ne: 0 } }
		},
			{
				$project: {
					username: 1,
					email: 1,
					name: 1,
					gender: 1,
					phone: 1,
					address: 1,
					status: 1,
					location: 1,
					emergency_contact: 1,


				}
			}, {
				$project: {
					//question: 1,
					document: "$$ROOT"
				}
			}, {
				$group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
			}];
		db.GetAggregation('users', bannerQuery, function (err, docdata) {
			if (err) {
				res.send(err);
			} else {
				if (docdata.length != 0) {
					var fields = ['username', 'name.first_name', 'name.last_name', 'email', 'gender', 'phone.code', 'phone.number', 'address.city', 'address.state', 'address.zipcode', 'address.country', 'emergency_contact.name', 'emergency_contact.email', 'emergency_contact.phone.code', 'emergency_contact.phone.number'];
					var fieldNames = ['User Name', 'First Name', 'Last Name', 'User mail', 'Gender', 'Phone code', 'Phone number', 'Address city', 'State', 'zipcode', 'Country', 'Emergency_contact name', 'Emergency_contact Email', 'Emergency_contact Mobile Code', 'Emergency_contact Mobile Number'];
					var mydata = docdata[0].documentData;
					json2csv({ data: mydata, fields: fields, fieldNames: fieldNames }, function (err, csv) {
						if (err);
						var filename = 'uploads/csv/users-' + new Date().getTime() + '.csv';
						fs.writeFile(filename, csv, function (err) {
							if (err) throw err;
							res.download(filename);
						});
					});
				} else {
					res.send([0, 0]);
				}
			}
		});
	}


	controller.userexportpost = function (req, res) {
		var bannerQuery = [{
			"$match": { status: { $ne: 0 } }
		},
			{
				$project: {
					username: 1,
					email: 1,
					name: 1,
					gender: 1,
					phone: 1,
					address: 1,
					status: 1,
					location: 1,
					emergency_contact: 1,


				}
			}, {
				$project: {
					//question: 1,
					document: "$$ROOT"
				}
			}, {
				$group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
			}];
		db.GetAggregation('users', bannerQuery, function (err, docdata) {
			if (err || docdata.length == 0) {
				res.send({ error: 'No Data' });
			} else {
				res.send(docdata);
			}
		});
	}


	controller.taskerexport = function (req, res) {
		var bannerQuery = [{
			"$match": { status: { $ne: 0 } }
		},
			{
				$project: {
					username: 1,
					email: 1,
					gender: 1,
					phone: 1,
					name: 1,
					address: 1,
					status: 1,
					availability: 1,
					location: 1,
					emergency_contact: 1,
					birthdate: 1,
				}
			}, {
				$project: {
					//question: 1,
					document: "$$ROOT"
				}
			}, {
				$group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
			}];
		db.GetAggregation('tasker', bannerQuery, function (err, docdata) {
			if (err) {
				res.send(err);
			} else {
				if (docdata.length != 0) {
					var fields = ['username', 'name.first_name', 'name.last_name', 'email', 'gender', 'phone.code', 'phone.number', 'address.city', 'address.state', 'address.zipcode', 'address.country', 'availability'];
					var fieldNames = ['UserName', 'First Name', 'Last Name', ' Email Id', 'Gender', 'Phone Code', 'Phone Number', 'City', 'State', 'Zipcode', 'Country', 'Tasker Availability'];
					var mydata = docdata[0].documentData;
					json2csv({ data: mydata, fields: fields, fieldNames: fieldNames }, function (err, csv) {
						if (err);
						var filename = 'uploads/csv/taskers-' + new Date().getTime() + '.csv';
						fs.writeFile(filename, csv, function (err) {
							if (err) throw err;
							res.download(filename);
						});
					});
				} else {
					res.send([0, 0]);
				}
			}
		});
	}


	controller.taskerexportpost = function (req, res) {
		var bannerQuery = [{
			"$match": { status: { $ne: 0 } }
		},
			{
				$project: {
					username: 1,
					email: 1,
					gender: 1,
					phone: 1,
					name: 1,
					address: 1,
					status: 1,
					availability: 1,
					location: 1,
					emergency_contact: 1,
					birthdate: 1,
				}
			}, {
				$project: {
					//question: 1,
					document: "$$ROOT"
				}
			}, {
				$group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
			}];
		db.GetAggregation('tasker', bannerQuery, function (err, docdata) {
			if (err || docdata.length == 0) {
				res.send({ error: 'No Data' });
			} else {
				res.send(docdata);
			}
		});
	}

	controller.transactionexport = function (req, res) {
		var bannerQuery = [{
			"$match": { status: { $ne: 0 } }
		},
			{
				$lookup:
				{
					from: "task",
					localField: "task",
					foreignField: "_id",
					as: "task"
				}
			},
			{
				$unwind:
				{
					path: "$task", preserveNullAndEmptyArrays: true

				}
			},
			{
				$lookup:
				{
					from: "tasker",
					localField: "tasker",
					foreignField: "_id",
					as: "tasker"
				}
			}, {
				$lookup:
				{
					from: "users",
					localField: "user",
					foreignField: "_id",
					as: "user"
				}
			}, {
				$lookup:
				{
					from: "categories",
					localField: "task.category",
					foreignField: "_id",
					as: "category"
				}
			},
			{
				$project: {
					task: 1,
					user: 1,
					type: 1,
					amount: 1,
					task_date: 1,
					tasker: 1,
					category: 1
				}
			}, {
				$project: {
					document: "$$ROOT"
				}
			}, {
				$group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
			}];
		db.GetAggregation('transaction', bannerQuery, function (err, docdata) {
			if (err) {
				res.send(err);
			} else {
				if (docdata.length != 0) {
					var fields = ['task.booking_id', 'category[0].name', 'user[0].name.first_name', 'tasker[0].name.first_name', 'task_date', 'amount', 'type'];
					var fieldNames = ['Booking ID', 'Task', 'User Name', 'Tasker Name', 'Task Completed At', 'Amount', 'Type'];
					var mydata = docdata[0].documentData;
					json2csv({ data: mydata, fields: fields, fieldNames: fieldNames }, function (err, csv) {
						if (err);
						var filename = 'uploads/csv/transactions-' + new Date().getTime() + '.csv';
						fs.writeFile(filename, csv, function (err) {
							if (err) throw err;
							res.download(filename);
						});
					});
				} else {
					res.send([0, 0]);
				}

			}
		});
	}

	controller.transactionexportpost = function (req, res) {
		var bannerQuery = [{
			"$match": { status: { $ne: 0 } }
		},
			{
				$lookup:
				{
					from: "task",
					localField: "task",
					foreignField: "_id",
					as: "task"
				}
			},
			{
				$unwind:
				{
					path: "$task", preserveNullAndEmptyArrays: true

				}
			},
			{
				$lookup:
				{
					from: "tasker",
					localField: "tasker",
					foreignField: "_id",
					as: "tasker"
				}
			}, {
				$lookup:
				{
					from: "users",
					localField: "user",
					foreignField: "_id",
					as: "user"
				}
			}, {
				$lookup:
				{
					from: "categories",
					localField: "task.category",
					foreignField: "_id",
					as: "category"
				}
			},
			{
				$project: {
					task: 1,
					user: 1,
					type: 1,
					amount: 1,
					task_date: 1,
					tasker: 1,
					category: 1
				}
			}, {
				$project: {
					document: "$$ROOT"
				}
			}, {
				$group: { "_id": null, "count": { "$sum": 1 }, "documentData": { $push: "$document" } }
			}];
		db.GetAggregation('transaction', bannerQuery, function (err, docdata) {
			if (err || docdata.length == 0) {
				res.send({ error: 'No Data' });
			} else {
				res.send(docdata);
			}
		});
	}




	return controller;
}
