var _ = require('lodash');

var scraperNames = ['transferto', 'ezetop'],
    scrapers = {};

_.each(scraperNames, function (scraperName) {
  scrapers[scraperName] = require('./' + scraperName);
});

exports.scrapTarget = function (target, done) {
  var scraper = scrapers[target];

  if (!scraper)
    return done({message: 'No scraper found for target ' + target, source: 'bonus_scraper', status: 'no_scraper'});

  scraper.run(done);
};