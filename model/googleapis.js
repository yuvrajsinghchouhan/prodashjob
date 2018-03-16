var http = require('http');

function geocode(data, callback) {
    return http.get({
        protocol: 'http:',
        host: 'maps.googleapis.com',
        path: '/maps/api/geocode/json?latlng=' + data.latitude + ',' + data.longitude + '&sensor=false'
    }, function(response) {
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            var parsed = JSON.parse(body);
            callback(parsed.results);
        });
    });
}

function directions(data, callback) {
    return http.get({
        protocol: 'http:',
        host: 'maps.googleapis.com',
        path: '/maps/api/directions/json?origin=' + data.from + '&destination=' + data.to + '&alternatives=true&sensor=false&mode=driving'
    }, function(response) {
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            var parsed = JSON.parse(body);
            callback(parsed);
        });
    });
}

module.exports = {
    "geocode": geocode,
    "directions": directions
};