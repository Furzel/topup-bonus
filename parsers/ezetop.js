var _ = require('lodash'),
    cheerio = require('cheerio'),
    parsingUtils = require('../utils/parsing'),
    stringHash = require('string-hash'),
    moment = require('moment');

exports.run = function (json) {
  return _.chain(json)
          .map(function (promotion) {
            var dates = parseDates(promotion);

            if (!dates) {
              console.error('ERROR Could not parse dates', promotion);
              return null;
            }

            var minTopup = getMinTopup(promotion.terms);

            if (!minTopup) {
              console.error('ERROR Could not parse minimum topup', promotion);
              return null;
            }

            var operatorSlug = getOperatorSlug(promotion);

            return {
              idHash: stringHash(promotion.id.toString()),
              operatorSlug: operatorSlug,
              provider: 'ezetop',
              countryCode: promotion.country_code, // should run against our own toCountryCode() to make sure they give us clean input
              dateStart: dates.dateStart,
              dateEnd: dates.dateEnd,
              title: promotion.title_desktop,
              termsAndConditions: promotion.terms, // @WARNING unsafe to display as is
              minTopup: minTopup,
              multiplier: parsingUtils.parseMultiplier(promotion.title_desktop)
            };
          })
          .reject(_.isNull)
          .value();
};

function getOperatorSlug (promotion) {
  var operatorName = promotion.operator_name.trim().toLowerCase().replace(/[^\w\d]/g, ''),
      countryName = promotion.country_name.trim().toLowerCase().replace('&', 'and')
                                                               .replace(/ /g, '-')
                                                               .replace(/[^\w\d-]/g, '');


  return operatorName + '-' + countryName;
}

function parseDates (promotion) {
  var dateStart = moment(promotion.date_start).unix(),
      dateEnd = null;

  if (hasEndDate(promotion.terms))
    dateEnd = moment(promotion.date_end).unix();

  return {
    dateStart: dateStart,
    dateEnd: dateEnd
  };
}

function hasEndDate (terms) {
  var $ = cheerio.load(terms),
      noEndDate = false;

  if ($('table tr:nth-child(3) > td:nth-child(1)').text().toLowerCase().indexOf('date') !== -1) {
    var dateString = $('table tr:nth-child(3) > td:nth-child(2)').text().trim();

    if (dateString.toLowerCase().indexOf('until further notice') !== -1) {
      noEndDate = true;
    }
  }

  return !noEndDate;
}

function getMinTopup (terms) {
  var $ = cheerio.load(terms),
      minTopupString = '';

  if ($('table > tr:nth-child(4)').text().toLowerCase().indexOf('minimum amount') !== -1) {
    var splitted = $('table > tr:nth-child(4)').text().split(':');

    if (!splitted || splitted.length < 2)
      return null;

    minTopupString = splitted[1].trim();
  }

  if (!minTopupString || minTopupString === '')
    return null;

  if (minTopupString.toLowerCase().indexOf('all recharges') !== -1)
    return {
      value: -1,
      currency: 'N/A'
    };

  return parsingUtils.parseCurrency(minTopupString);
}