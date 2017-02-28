

var express = require('express'),
  config = require('./config/config'),
  glob = require('glob'),
  mongoose = require('mongoose');

var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyCwcvDpKLJLFTmE_-GaeS4e52BdzcKW5wY'
});

mongoose.Promise = global.Promise;
mongoose.connect(config.db);
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});

  /*googleMapsClient.distanceMatrix({
    origins: [ "Guacara, Carabobo, Venezuela" ],
    destinations: [ "Lima, Lima, Perú" ],
    mode: 'driving'
  }, function(err, response) {
    if (!err) {
      console.log('results: ' + JSON.stringify(response, null, ' '));
      // console.log('results: ' + JSON.stringify(response.json.results, null, ' '));
    } else {
      console.log('err: ' + err);
    }
  });*/
  /*const request = require('request');

  request('https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=10.235875,%20-67.880716&destinations=9.225224,-66.014595&key=AIzaSyCwcvDpKLJLFTmE_-GaeS4e52BdzcKW5wY', (err, response) => {
    if (err) {
      console.log(JSON.stringify(err, null, ' '));
    }
    console.log(response.body);
  });*/

/*var models = glob.sync(config.root + '/app/models/*.js');
models.forEach(function (model) {
  require(model);
});*/
var app = express();

module.exports = require('./config/express')(app, config);

app.listen(config.port, function () {
  console.log('Express server listening on port ' + config.port);
});

