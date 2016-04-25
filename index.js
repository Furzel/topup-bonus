var scrapers = require('./scrapers'),
    async = require('async'),
    parsers = require('./parsers');

var promotions = [];

async.each(['ezetop', 'transferto'], function (target, done) {
  scrapers.scrapTarget(target, function (err, json) {
    if (err) 
      return done(err);

    promotions = promotions.concat(parsers.parseJSON(target, json));

    done();
  });
}, function (err) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  console.log(JSON.stringify(promotions));
});