var config = require('../config'),
    request = require('request');

exports.run = function (done) {
  request.get({url: config.ezetop_url, json: true}, function (err, res, json) {
    if (err || res.statusCode != 200)
      return done({message: 'Could not get data for ' + config._url, source: 'ezetop_scraper', status: 'status_code_' + res.statusCode || 'none'});
    
    done(null, json);
  });
};