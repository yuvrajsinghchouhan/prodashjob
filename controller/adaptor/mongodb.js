var db = require('../../model/mongodb.js');

function GetDocument(model, query, projection, extension, callback) {
    var query = db[model].find(query, projection, extension.options);
    if (extension.populate) {
        query.populate(extension.populate);
    }
    if (extension.sort) {
        query.sort(extension.sort);
    }
    query.exec(function (err, docs) {
        if (extension.count) {
            query.count(function (err, docs) {
                callback(err, docs);
            });
        } else {
            callback(err, docs);
        }
    });
}

function GetOneDocument(model, query, projection, extension, callback) {
    var query = db[model].findOne(query, projection, extension.options);
    if (extension.populate) {
        query.populate(extension.populate);
    }
    if (extension.sort) {
        query.sort(extension.sort);
    }
    query.exec(function (err, docs) {
        callback(err, docs);
    });
}

function GetAggregation(model, query, callback) {
    db[model].aggregate(query).exec(function (err, docs) {
        callback(err, docs);
    });
}

function InsertDocument(model, docs, callback) {
    var doc_obj = new db[model](docs);
    doc_obj.save(function (err, numAffected) {
        callback(err, numAffected);
    })
}

function DeleteDocument(model, criteria, callback) {
    db[model].remove(criteria, function (err, docs) {
        callback(err, docs);
    });
}

function UpdateDocument(model, criteria, doc, options, callback) {
    db[model].update(criteria, doc, options, function (err, docs) {
        callback(err, docs);
    });
}

function GetCount(model, conditions, callback) {
    db[model].count(conditions, function (err, count) {
        callback(err, count);
    });
}


function PopulateDocument(model, docs, options, callback) {
    db[model].populate(docs, options, function (err, docs) {
        callback(err, docs);
    });
}

function RemoveDocument(model, criteria, callback) {
    db[model].remove(criteria, function (err, docs) {
        callback(err, docs);
    });
}

module.exports = {
    "GetDocument": GetDocument,
    "GetOneDocument": GetOneDocument,
    "InsertDocument": InsertDocument,
    "DeleteDocument": DeleteDocument,
    "UpdateDocument": UpdateDocument,
    "GetAggregation": GetAggregation,
    "PopulateDocument": PopulateDocument,
    "RemoveDocument": RemoveDocument,
    "GetCount": GetCount
};