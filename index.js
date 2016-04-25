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

/*

Basic usage : 

This will just output a JSON of both transferto and ding promotions in a simple data structure : 

{
  "idHash": 861975789,
  "operatorSlug": "natcom-haiti",
  "provider": "transferto",
  "countryCode": "HT",
  "dateStart": 1457931600,
  "dateEnd": 1462078740,
  "title": "Get GB on your phone",
  "termsAndConditions": "- 6 USD to 9 USD Top Up from overseas, ..."
  "minTopup": {
    "value": 6,
    "currency": "USD"
  }
}

I'm not saving it in a database at the moment because what I do will most likely be different 
than what you are using. In a relational database this could be indexed by country and/or providers 
depending on what kind of queries will be run most of the time. 

The idHash attribute can be used to remove outdated entries in the database, once all the promotions
are retrieved any promotion whose idHash is not in the most recent update can be deleted (indexing 
the idHash column will help). Promotions whose end_date is behind today's date can also be safely removed
either by a CRON task or afeter every update 


Scraping part :

The scraping part is fairly simple since we can hit the feeds in a clean way and should be pretty robust 
as long as the URL does not change


Parsing part : 

Most of the parsing part would ideally relly on shared utility function that parse country, currency, 
provider and so on. I din't built it because it would take quite a while and I believe you must already
have something similar in your codebase to handle this. The main point about having this utility library
is to back it up with a big test suit that grows with each failed parsing. 

Another thing that would need to be added is a way to see parsing errors out of the server, my take on this
would be to have a dedicated slack/hipchat/whatever chanel that receive alerts when a parser fails with
all the relevant data to debug it further. This monitoring would be good for incrementaly improving the 
parser but also as an alarm when a breaking change happens on the feeds. I used console.error to simulate 
this in both parsers 

Some countries on the transferto feed are not recognized by the package I use because it's lookup is case 
sensitive, as said above this would be fixed by having a robust utility function to parse country name into
country codes.  

The terms and condition part is as raw as it gets at the moment, I don't know how far you want to get with 
that part, but this should be at least sanitized against js injection if it is to be displayed as is. If you
want to create a standard format among all providers it gets complicated quickly, transferto has no 
convention for their terms so formating their promotions will take some time, ding on the other hand
has a standard format for all their term and conditions which will make it easy to use. 

PS: The error for the "Unefon" promotion comes from a bug in htmlparser2 which the small parser I use is 
based upon, I have encountered this bug before when I was parsing emails, there are ways to fix this but
it's a case by case scenario which takes forever to debug so I focused on getting the rest of it working
rather than this specific case.   
*/