var json2csv = require('json2csv');
var multer = require('multer');
var fs = require('fs');

function jsontocsv(column_header, data, path, callback) {
    json2csv({ data: data, fields: column_header }, function (err, csv) {
        if (err);
        fs.writeFile(path, csv, function (err) {
            if (err) {
                callback(err);
            }
            callback('file saved');
        });
    });
}

function commonUpload(destinationPath) {
    var storage = multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, destinationPath);
        },
        filename: function (req, file, callback) {
            var uploadName = file.originalname.split('.');
            var extension = '.' + uploadName[uploadName.length - 1];
            var fileName = Date.now().toString();
            fs.readFile(destinationPath + file.originalname, function (err, res) {
                if (!err) {
                    callback(null, fileName + extension);
                } else {
                    callback(null, fileName + extension);
                }
            });
        }
    });

    var uploaded = multer({ storage: storage }); /**----{limits : {fieldNameSize : 100}}---*/
    return uploaded;
}

module.exports = {
    jsontocsv: jsontocsv,
    commonUpload: commonUpload
};
