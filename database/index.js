var data = require('../data/database.json');

var _ = require('lodash'),
    path = require('path'),
    fs = require('fs');

exports.updatePromotions = function (promotions) {
  // start by removing old promotions, if they do not exists anymore
  // they will be effectively deleted and existing promotions
  // will be updated with the new ones anyway.
  _.each(data, function (country) {
    _.each(country.operators, function (operator) {
      _.each(operator.providers, function (provider) {
        provider.promotions = [];
      });
    });
  });

  var inserted = 0;

  _.each(promotions, function (promotion) {
    debugger;
    var country = data[promotion.countryCode];

    if (!country) {
      console.error('Country not found', promotion.countryCode);
      return;
    }

    var operator = country.operators[promotion.operatorSlug];

    if (!operator) {
      console.error('Operator not found', promotion.operatorSlug);
      return;
    }

    var provider = operator.providers[promotion.provider];

    if (!provider) {
      console.error('Provider not found', promotion.provider);
      return;
    }

    provider.promotions.push(promotion);
    inserted++;
  });

  console.log('inserted', inserted, '/', promotions.length, 'promotions');
};

exports.getPromotionsForCountry = function (countryCode) {
  var country = data[countryCode],
      promotions = [];

  if (!country)
    return [];

  _.each(country.operators, function (operator) {
    _.each(operator.providers, function (provider) {
      promotions = promotions.concat(provider.promotions);
    });
  });

  return promotions;
};

exports.getPromotionsForOperator = function (countryCode, operatorSlug) {
  var country = data[countryCode],
      promotions = [];

  if (!country)
    return [];

  var operator = country.operators[operatorSlug];

  if (!operator)
    return [];

  _.each(operator.providers, function (provider) {
    promotions = promotions.concat(provider.promotions);
  });

  return promotions;
};

exports.save = function (done) {
  fs.writeFile(path.join(__dirname, '../data/database1.json'), JSON.stringify(data), done);
};