var db = require('../../controller/adaptor/mongodb.js');
var attachment = require('../../model/attachments.js');
var middlewares = require('../../model/middlewares.js');
var async = require('async');
var mongoose = require('mongoose');

module.exports = function () {
	var router = {};
		router.getpage = function getpage(req, res) {
		//console.log("req.body.language",req.body.language);
		if(req.body.language != undefined){
				 db.GetDocument('languages', { $and: [ { status: { $ne: 0 } }, { name: req.body.language } ] }, {}, {}, function (err,languagedata) {
                 if (err || languagedata.length == 0) {
                res.send(err);
                } else {
					db.GetDocument('pages', { slug : req.body.slug }, {}, {}, function (err,pagedetailsdata) {
						if (err) {
						res.send(err);
						} else {
							var language = languagedata[0]._id;
								db.GetDocument('pages', { $and: [ { status: { $ne: 0 } }, { parent: new mongoose.Types.ObjectId(pagedetailsdata[0]._id) } , { language: new mongoose.Types.ObjectId(language) } ] }, {}, {}, function (err, pagedata) {
									if (err || pagedata.length == 0) {
											db.GetDocument('pages', { $and: [ { status: { $ne: 0 } }, { _id: new mongoose.Types.ObjectId(pagedetailsdata[0]._id) } ] }, {}, {}, function (err, pagedata) {
														if(err || pagedata.length == 0) {
																res.send(err)
														}else{
															res.send(pagedata);
														}
											});
										} else {
											console.log("pagedata",pagedata);
											res.send(pagedata);
									}
								});
						}
					});
		 		}
			});
		}else{
			db.GetDocument('languages', { default : { $eq: 1 } }, {}, {}, function (err,languagedata) {
				if (err) {	
						res.send(err);
						} else {
									db.GetDocument('pages', { slug : req.body.slug }, {}, {}, function (err,pagedetailsdata) {
												if (err) {	
												res.send(err);
												} else {
													var language = languagedata[0]._id;
														db.GetDocument('pages', { $and: [ { status: { $ne: 0 } }, { parent: new mongoose.Types.ObjectId(pagedetailsdata[0]._id) } , { language: new mongoose.Types.ObjectId(language) } ] }, {}, {}, function (err, pagedata) {
															if (err || pagedata.length == 0) {
																	db.GetDocument('pages', { $and: [ { status: { $ne: 0 } }, { _id: new mongoose.Types.ObjectId(pagedetailsdata[0]._id) } ] }, {}, {}, function (err, pagedata) {
																				if(err || pagedata.length == 0) {
																						res.send(err)
																				}else{
																					res.send(pagedata);
																				}
																	});
																} else {
																	res.send(pagedata);
															}
														});
												}
											});
								
									}
				});
		}
		


		/*db.GetOneDocument('pages', { slug: req.body.slug, status: 1}, {}, {}, function (err, docdata) {
			if (err || !docdata) {
				res.send(err);
			} else {
				console.log("docdata",docdata);
					res.send(docdata);
			}
		});*/
	}

	router.getfaq = function getfaq(req, res) {
		db.GetDocument('faq', { $and: [{ status: { $ne: 0 } }, { status: { $ne: 2 } }] }, {}, {}, function (err, docdata) {
			if (err) {
				res.send(err);
			} else {
				res.send(docdata);
			}
		});
	};

	return router;
};
