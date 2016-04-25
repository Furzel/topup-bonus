var xmlParser = require('xml2js').Parser(),
    request = require('request'),
    config = require('../config.json');

exports.run = function (done) {
  request(config.transferto_url, function (err, res, body) {
    if (err || res.statusCode != 200)
      return done({message: 'Could not get data for ' + config.transferto_url, source: 'transferto_scraper', status: 'status_code_' + res.statusCode || 'none'});

    xmlParser.parseString(body, function (err, json) {
      if (err)
        return done({message: 'Could not parse transferto XML', source: 'transferto_scraper', status: 'xml_parse_failed'});

      if (!json || !json.rss || !json.rss.channel || !json.rss.channel[0] || !json.rss.channel[0].item)
        return done({message: 'Unexpected json for transferto', source: 'transferto_scraper', status: 'unexpected_json'});

      done(null, json.rss.channel[0].item);
    });
  });
};