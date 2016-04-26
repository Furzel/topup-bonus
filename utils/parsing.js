var currencies = require('country-data').currencies,
    _ = require('lodash');

exports.parseCurrency = function (currencyString) {
  // remove whitespace for cleaner regex
  currencyString = currencyString.replace(' ', '');

  // this part should be in an utility module but I'm guessing you already 
  // have a currency parsing method
  var currencyMatch = currencyString.match(/([^\W\d]+)/),
      currencySymbolMatch = currencyString.match(/([^\w\d]+)/);

  var currency = null;

  if (currencyMatch && currencyMatch.length > 1) {
    currency = _.find(currencies.all, function (currency) {
      return currencyMatch[1].indexOf(currency.code) !== -1;    
    });
  } else if (currencySymbolMatch && currencySymbolMatch.length > 1) {
    currency = _.find(currencies.all, function (currency) {
      return currencySymbolMatch[1].indexOf(currency.symbol) !== -1;    
    });
  }

  if (!currency) 
    return null;

  var value = parseFloat(currencyString.replace(/[^0-9-.]/g, ''));

  if (!value)
    return null;

  return {
    value: value,
    currency: currency.code
  };
};

exports.parseMultiplier = function (multiplierString) {
  multiplierString = multiplierString.toLowerCase();

  // look for "Bonus 2x" strings
  if (xTimesRegEx.test(multiplierString) && multiplierString.indexOf('bonus') !== -1)
    return parseFloat(multiplierString.match(xTimesRegEx)[1]);

  // look for "Bonus 200%" strings
  if (percentageRegEx.test(multiplierString) && multiplierString.indexOf('bonus') !== -1) {
    var percentage = parseFloat(multiplierString.match(percentageRegEx)[1]);

    return _.round(percentage / 100, 1);
  }

  if (multiplierString.indexOf('double bonus') !== -1 ||
      multiplierString.indexOf('double bubble') !== -1) {
    return 2;
  }

  if (multiplierString.indexOf('triple bonus') !== -1 ||
      multiplierString.indexOf('triple bubble') !== -1) {
    return 3;
  }

  return null;  
};


var xTimesRegEx = /([\d]+) ?x/,
    percentageRegEx = /([\d]+) ?%/;