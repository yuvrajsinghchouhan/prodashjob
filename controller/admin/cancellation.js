"use strict";
module.exports = function(){
    var db = require('../../controller/adaptor/mongodb.js')
        , CONFIG      = require('../../config/config');
    var   attachment  = require('../../model/attachments.js');
    var controller = {};


    controller.list = function(req,res){
      var errors = req.validationErrors();
            if (errors) {
                res.send(errors, 400);
                return;
            }

            if (req.body.sort) {
                var sorted = req.body.sort.field;
            }

        var cancelQuery = [
			{"$match":{status: { $ne: 0 } } },
			{$project: { reason:1,  type:1, status:1}},
			{$project: {type: 1, document: "$$ROOT"}},
			{ $group:{"_id":null,"count":{"$sum":1},"documentData":{$push:"$document"}}
        }];

        var sorting = {};
        var searchs = '';

       var condition = { status: { $ne: 0 } };
            cancelQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });

            if (req.body.search) {
                condition['reason'] = { $regex: new RegExp('^' + req.body.search, 'i') };
                var searchs = req.body.search;
                cancelQuery.push({ "$match":
                 {
                      $or: [
                            {"documentData.reason": { $regex: searchs + '.*', $options: 'si' } },
                            {"documentData.type": { $regex: searchs + '.*', $options: 'si' } }
                      ]
                        }
                        });
                          //search limit
             cancelQuery.push({$group: { "_id": null, "countvalue": { "$sum": 1 }, "documentData": { $push: "$documentData" } }});
             cancelQuery.push({ $unwind: { path: "$documentData", preserveNullAndEmptyArrays: true } });
              if (req.body.limit && req.body.skip >= 0) {
                cancelQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
              }
             cancelQuery.push({ $group: { "_id": null, "count": { "$first": "$countvalue" }, "documentData": { $push: "$documentData" } } });
//search limit
            }

            var sorting = {};
            if (req.body.sort) {
                var sorter = 'documentData.' + req.body.sort.field;
                sorting[sorter] = req.body.sort.order;
                cancelQuery.push({ $sort: sorting });
            } else {
                sorting["documentData.createdAt"] = -1;
                cancelQuery.push({ $sort: sorting });
            }

            if ((req.body.limit && req.body.skip >= 0) && !req.body.search) {
                cancelQuery.push({ '$skip': parseInt(req.body.skip) }, { '$limit': parseInt(req.body.limit) });
            }
            //cancelQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
              if(!req.body.search){
            cancelQuery.push({ $group: { "_id": null, "count": { "$first": "$count" }, "documentData": { $push: "$documentData" } } });
 }

            db.GetAggregation('cancellation', cancelQuery, function (err, docdata) {
                if (err || docdata.length <= 0) {
                    res.send([0, 0]);
                } else {

                    res.send([docdata[0].documentData, docdata[0].count]);
                }
            });
    }

controller.edit = function(req,res){
            var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }
        db.GetDocument('cancellation',{_id:req.body.id},{},{},function(err,data){
            if(err){
                res.send(err);
            }else {
                res.send(data);
            }
        });
}

controller.save = function(req,res){

        req.checkBody('reason', 'Invalid holder name').notEmpty();
        req.checkBody('type', 'Invalid option_name name').notEmpty();
        req.checkBody('status', 'Slider status is invalid').notEmpty();

            var errors = req.validationErrors();

        if (errors) {
            res.send(errors, 400);
            return;
        }

        var data = {};

        data.reason = req.body.reason;
        data.type = req.body.type;
        data.status = req.body.status;
        if(req.body._id) {
            db.UpdateDocument('cancellation', {_id:{$in:req.body._id}}, data,function(err,result){
            if(err){
                res.send(err);
            }else
            {
                res.send(result);
            }
        });
        } else {
        db.InsertDocument('cancellation',data, function(err,result) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.send(result);
                    }
                });
        }
}

controller.deletecancellation = function(req,res){
        req.checkBody('delData', 'Invalid delData').notEmpty();
            var errors = req.validationErrors();
        if (errors) {
            res.send(errors, 400);
            return;
        }

    //    db.UpdateDocument('cancellation', {_id:{$in:req.body.delData}},{status:0},{multi:true},function(err,docdata){
        db.DeleteDocument('cancellation', {_id : {$in:req.body.delData} },function (err,docdata){
            if(err){
                res.send(err);
            }else {
                res.send(docdata);
            }
        });
}
return controller;
/*module.exports = router;*/
}
