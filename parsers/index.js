var _ = require('lodash');

var parserNames = ['transferto', 'ezetop'],
    parsers = {};

_.each(parserNames, function (parserName) {
  parsers[parserName] = require('./' + parserName);
});

exports.parseJSON = function (target, json) {
  var parser = parsers[target];

  if (!parser) {
    console.error({message: 'No parser found for target ' + target, source: 'promotions_parser', status: 'no_parser'});
    return null;
  }

  return parser.run(json);
};