// From http://blog.miguelgrinberg.com/post/easy-web-scraping-with-nodejs

var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var people = require(process.argv[2]);

var scrapeEntry = function(person, doneCallback) {
  var url = people[person];
  var citation_data = {};

  request({ encoding: 'binary', method: "GET", uri: url + "&pagesize=100"}, function(err, resp, body) {
    var $ = cheerio.load(body);

    try {
      // We're output to stdout, so log to stderr
      console.error("Scraping " + person + "...");

			var citations = [];

			$('.gsc_a_tr').each(function(i, elem) {
				c = {}
				c['title'] = $(this).find('.gsc_a_at').text();
				$(this).find('.gs_gray').each(function (j, jelem) {
					if (j == 0)
						c['authors'] = $(this).text();
					if (j == 1)
						c['journal'] = $(this).text();
				});
				c['counts'] = $(this).find('.gsc_a_c').text();
				c['year'] = $(this).find('.gsc_a_y').text();
				
				if (c['counts'] > 100)
					citations.push(c);
			});

      citation_data = {
        'citations' : citations
      };

			

    } catch (ex) {
      console.error(ex);
      throw new Error(person);
    }

    // Adding a timeout to regulate scraping speed.
    setTimeout(function() {
      doneCallback(null, citation_data);
    }, 1000);
  });
};

// http://javascriptplayground.com/blog/2013/06/think-async/
async.mapSeries(Object.keys(people), scrapeEntry, function (err, results) {
  var date = new Date();
  console.log('var date = "' + date + '"');
  console.log('var data = ' + JSON.stringify(results, null, 2) + ';');
});
