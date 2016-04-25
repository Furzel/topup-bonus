var scrapers = require('./scrapers');

scrapers.scrapTarget('ezetop', function (err, json) {
  if (err)
    console.log(err);
  else
    console.log(json);
});