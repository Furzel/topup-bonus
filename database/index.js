var data = require('../data/database.json');

var _ = require('lodash'),
    moment = require('moment'),
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

exports._getSimilarPromotions = function () {
  var similarPromotions = [];
  _.each(data, function (country) {
    _.each(country.operators, function (operator) {
      var ezetop = operator.providers['ezetop'],
          transferto = operator.providers['transferto'];

      if (!ezetop || !transferto)
        return;

      _.each(ezetop.promotions, function (ezeTopPromotion) {
        _.each(transferto.promotions, function (transfertoPromotion) {
          // this BIG if condition searches for two promotions that are similar with different providers:
          // - same currency
          // - active at current date
          // - both have a multiplier or are special offers without multiplier
          // We however ignore them if they have the exact same characteristics
          if (ezeTopPromotion.minTopup.currency === transfertoPromotion.minTopup.currency &&
              (ezeTopPromotion.dateEnd === null || ezeTopPromotion.dateEnd > moment().unix()) &&
              (transfertoPromotion.dateEnd === null || transfertoPromotion.dateEnd > moment().unix()) &&
              ((transfertoPromotion.multiplier === null && ezeTopPromotion.multiplier === null) ||
               (transfertoPromotion.multiplier !== null && ezeTopPromotion.multiplier !== null)) &&
              (!(transfertoPromotion.multiplier === ezeTopPromotion.multiplier && 
                 transfertoPromotion.minTopup.value === ezeTopPromotion.minTopup.value &&
                 transfertoPromotion.minTopup.currency === ezeTopPromotion.minTopup.currency))) {

            similarPromotions.push({
              ezetop: ezeTopPromotion.title + ' -- multiplier: ' + ezeTopPromotion.multiplier + ' minTopup: ' + ezeTopPromotion.minTopup.value + ' ' + ezeTopPromotion.minTopup.currency,
              transferto: transfertoPromotion.title + ' -- multiplier: ' + transfertoPromotion.multiplier + ' minTopup: ' + transfertoPromotion.minTopup.value + ' ' + transfertoPromotion.minTopup.currency
            });
          } 
        });
      });
    });
  });

  return similarPromotions;
};

exports.save = function (done) {
  fs.writeFile(path.join(__dirname, '../data/database1.json'), JSON.stringify(data), done);
};