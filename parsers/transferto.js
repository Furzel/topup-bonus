var _ = require('lodash'),
    moment = require('moment'),
    parsingUtils = require('../utils/parsing'),
    stringHash = require('string-hash'),
    lookup = require('country-data').lookup;

var dateFormat = 'ddd, DD MMM YYYY HH:mm:ss Z';

exports.run = function (json) {
  return _.chain(json)
          .map(function (promotion) {
            // this package is clearly not good enough for production use
            // but I guess you have something stronger to find countries code 
            var country = lookup.countries({name: promotion.countryName});

            if (!country || !country[0]) {
              console.error('ERROR Could not match country ' + promotion.countryName);
              return null;
            }

            var minTopup = parseMinTopup(promotion);

            if (!minTopup) {
              console.error('ERROR Could not parse minimum topup ' + cleanString(promotion.denomination));
              return null;
            }

            var multiplier = parsingUtils.parseMultiplier(cleanString(promotion.title2));

            if (!multiplier)
              console.error('Could not parse multiplier ', cleanString(promotion.title2));

            var dateStart = moment(promotion.dateFrom, dateFormat).unix(),
                operatorSlug = promotion.operatorName.trim().toLowerCase().replace(/ /g, '-'),
                countryCode = country[0].alpha2;

            return {
              idHash: stringHash(countryCode + operatorSlug + dateStart + minTopup.value + minTopup.currency),
              operatorSlug: operatorSlug,
              provider: 'transferto',
              countryCode: countryCode,
              dateStart: dateStart,
              dateEnd: moment(promotion.dateTo, dateFormat).unix(),
              title: cleanString(promotion.title2),
              termsAndConditions: cleanString(promotion.description), // @WARNING not safe at all to display as is
              minTopup: minTopup,
              multiplier: multiplier
            };
          })
          .reject(_.isNull)
          .value();
};

// This should also validate that the currency found exists and 
// have a try catch around the parseInt() to avoid crashes
function parseMinTopup (promotion) {
  var minTopupString = '';

  if (promotion.denominationLocal) {
    minTopupString = cleanString(promotion.denominationLocal);
  }
  else
    minTopupString = cleanString(promotion.denomination);

  // indian providers have this weird promotion associated with a picture
  if (promotion.title2 && cleanString(promotion.title2).toLowerCase().indexOf('full talktime offer') !== -1)
    return {
      value: -1,
      currency: 'N/A'
    };

  if (!minTopupString || minTopupString.length === 0)
    return null;

  // promotions with no minimum topup
  if (minTopupString.toLowerCase().indexOf('any') !== -1)
    return {
      value: -1,
      currency: 'N/A'
    };
    
  // clean the string before attempting to parse the currency 
  minTopupString.replace('and up', '');

  return parsingUtils.parseCurrency(minTopupString);
}

function cleanString (str) {
  return str.trim().replace('\n', '').replace('\t', '');
}