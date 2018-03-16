"use strict";

module.exports = function () {

	var mongoose 		= require('mongoose');
	var db 				= require('../../controller/adaptor/mongodb.js');
    var async 			= require("async");

	var controller = {};

	controller.submitmainpage = function (req, res) {
		console.log("req.body",req.body);
		var data = {};
		data.seo = {};
		data.name = req.body.data.name;
		data.description = req.body.data.description;
		data.css_script = req.body.data.css_script;
		data.seo.title = req.body.data.seo.title;
		data.seo.keyword = req.body.data.seo.keyword;
		data.seo.description = req.body.data.seo.description;
		data.slug = req.body.data.slug;
		//data.parent = req.body.data.parent;
		data.status = req.body.data.status;
		if(req.body.data.language){
			data.language = req.body.data.language;
		}
		if(req.body.data.parent){
			data.parent =  req.body.data.parent;
		}
		if (req.body.data._id) {
			db.UpdateDocument('pages', { _id: new mongoose.Types.ObjectId(req.body.data._id) }, data, function (err, result) {
				if (err) {
					res.send(err);
				} else {
					res.send({ message: 'Pages Updated Successfully' });
				}
			});
		} else {
				   db.GetOneDocument('pages', { $and: [{ language: new mongoose.Types.ObjectId(data.language) }, { parent: new mongoose.Types.ObjectId(data.parent) }] }, {},{}, function (err, docdata) {
				   console.log("err, docdata",err, docdata);
				   if (docdata) {
					   var data1="Assigned";
						res.send(data1);
					} else {
						db.InsertDocument('pages', data, function (err, result) {
						if (err) {
							res.send(err);
						} else {
							res.send({ message: 'Pages Added Successfully' });
						}
						});
					}
			   });
			
		}
	}

	controller.translatelanguage = function (req, res) {
	       var count = {};
		   async.parallel([
                function (callback) {
                  	db.GetDocument('pages',{ $and: [ { status: { $ne: 0 } }, { parent: { $exists: false } } ] }, {}, {}, function (err, pagesdata) {
					    if (err) return callback(err);			
                        count.pagesdata = pagesdata;
                        callback();
                    });
                },
				function (callback) {
					  db.GetDocument('languages', { $and: [{ status: { $ne: 0 } },{ code: { $ne: 'en' } } ] }, {}, {}, function (err, languagedata) {
                        if (err) return callback(err);
                        count.languagedata = languagedata;
                        callback();
                    });
                
               }
            ], function (err) {
				//console.log("count",count);
                if (err) return next(err);
               if (err) {
                    res.send([0, 0]);
                } else {
                    res.send(count);
                }
            });
	}


	controller.getlist = function (req, res) {
		var errors = req.validationErrors();
		if (errors) {
			res.send(errors, 400);
			return;
		}

		if (req.body.sort) {
			var sorted = req.body.sort.field;
		}

		var pagesQuery = [{
			"$match": { $and: [ { status: { $ne: 0 } }, { parent: { $exists: false } } ] }
		}, {
			$project: {
				name: 1,
				createdAt: 1,
				status: 1,
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
		pagesQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });

		if (req.body.search) {
			condition['name'] = { $regex: new RegExp('^' + req.body.search, 'i') };
			var searchs = req.body.search;
			pagesQuery.push({ "$match": { "documentData.name": { $regex: searchs + '.*', $options: 'si' } } });
			 //search limit
             pagesQuery.push({$group: { "_id": null, "countvalue": { "$sum": 1 }, "documentData": { $push: "$documentData" } }});
             pagesQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });
              if (req.body.limit && req.body.skip >= 0) {
                pagesQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
              }
             pagesQuery.push({ $group: { "_id": null, "count": { "$first": "$countvalue" }, "documentData": { $push: "$documentData" } } });
			//search limit
		}

		var sorting = {};
		if (req.body.sort) {
			var sorter = 'documentData.' + req.body.sort.field;
			sorting[sorter] = req.body.sort.order;
			pagesQuery.push({ $sort: sorting });
		} else {
			sorting["documentData.createdAt"] = -1;
			pagesQuery.push({ $sort: sorting });
		}

		if ((req.body.limit && req.body.skip >= 0) && !req.body.search) {
			pagesQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
		}
		//pagesQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
		
  		if(!req.body.search){
            pagesQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
 		}	

		db.GetAggregation('pages', pagesQuery, function (err, docdata) {
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

	controller.getsublist = function (req, res) {
			console.log("req.body",req.body);
		var errors = req.validationErrors();
		if (errors) {
			res.send(errors, 400);
			return;
		}

		if (req.body.sort) {
			var sorted = req.body.sort.field;
		}

		var pagesQuery = [{
			"$match": { $and: [ { status: { $ne: 0 } }, { parent: new mongoose.Types.ObjectId(req.body.id) } ] }
			
		}, {
			$project: {
				name: 1,
				createdAt: 1,
				status: 1,
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
		pagesQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });

		if (req.body.search) {
			condition['name'] = { $regex: new RegExp('^' + req.body.search, 'i') };
			var searchs = req.body.search;
			pagesQuery.push({ "$match": { "documentData.name": { $regex: searchs + '.*', $options: 'si' } } });
		}

		var sorting = {};
		if (req.body.sort) {
			var sorter = 'documentData.' + req.body.sort.field;
			sorting[sorter] = req.body.sort.order;
			pagesQuery.push({ $sort: sorting });
		} else {
			sorting["documentData.createdAt"] = -1;
			pagesQuery.push({ $sort: sorting });
		}

		if ((req.body.limit && req.body.skip >= 0) && !req.body.search) {
			pagesQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
		}
		pagesQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });

		db.GetAggregation('pages', pagesQuery, function (err, docdata) {
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

	controller.deletepage = function (req, res) {
		req.checkBody('delData', 'Invalid delData').notEmpty();
		var errors = req.validationErrors();
		if (errors) {
			res.send(errors, 400);
			return;
		}
		db.UpdateDocument('pages', { _id: { $in: req.body.delData } }, { status: 0 }, { multi: true }, function (err, docdata) {
			if (err) {
				res.send(err);
			} else {
				res.send(docdata);
			}
		});
	}


	controller.editpage = function (req, res) {
		db.GetDocument('pages', { status: { $ne: 0 }, _id: req.body.id }, {}, {}, function (err, docdata) {
			if (err) {
				res.send(err);
			} else {
				res.send(docdata);
			}
		});
	}

	controller.getlistdropdown = function (req, res) {
		db.GetDocument('pages', { status: { $ne: 0 } }, {}, {}, function (err, docdata) {
			if (err) {
				res.send(err);
			} else {
				res.send(docdata);
			}
		});
	}

	return controller;
}
