var cheerio = require('cheerio');
var request = require('request');

var requestHTML = function(url, nbaVideoURLs) {
	var $;
	var nbaStream;
	//var nbaVideoURLs = []

	request(url, function(error, response, html) {

		if (!error) {
			$ = cheerio.load(html);
			var numRunningQueries = 0;
			$('#featured').find('a').each(function(i, elem) {
				if ($(this).attr('class') === undefined) {
					++numRunningQueries;

					nbaStream = {
						url: "",
						time: "",
						date: "",
						team1: "",
						team2: "",
						isBroadcasting: "",
						m3u8: "",
						roomSlug: ""
					};

					//parse URL for each game
					nbaStream.url = ("http://" + response.connection._host + '/' + $(this).attr('href'));

					//parse the time 
					nbaStream.time = $(this).children().eq(0).children().eq(0).children().eq(0).text() + " " +
						$(this).children().eq(0).children().eq(0).children().eq(1).children().eq(0).text().replace(/[\n  ]+/g, '') + " " + $(this).children().eq(0).children().eq(0).children().eq(1).children().eq(1).text().replace(/[\n  ]+/g, '');

					//parse the date
					nbaStream.date = $(this).prevAll('h3').first().text();

					//parse the first team
					nbaStream.team1 = $(this).children().eq(0).find('.box-title').eq(0).text().replace(/\n/g, '').replace(/  +/g, '');

					//parase the second team
					nbaStream.team2 = $(this).children().eq(0).find('.box-title').eq(1).text().replace(/\n/g, '').replace(/  +/g, '');


					requestURL(nbaStream, nbaVideoURLs, function() {
						numRunningQueries--;
						//console.log(numRunningQueries);
						if (numRunningQueries === 0) {
							console.log(nbaVideoURLs);

							
						}
					});

				}
			});

		} else {
			console.log(error);
			return nbaVideoURLs;
		}
	})
}

var requestURL = function(nbaStream, nbaVideoURLs, callback) {

	var $, link;

	//console.log(nbaStream.url);
	request(nbaStream.url, function(error, response, html) {

		if (!error) {
			$ = cheerio.load(html);
			link = "https://" + response.connection._host + "/" + $('#featured center iframe').attr('src');

			request(link, function(error, response, html) {
				if (!error) {
					$ = cheerio.load(html);
					link = $('#su-ivp').attr('src')
						//console.log(link);
					if (link != undefined) {
						//console.log(link);

						request(link, function(error, response, html) {
							if (!error) {

								var windowRoom;
								$ = cheerio.load(html);

								//Grab script text for streamup API
								windowRoom = $('*:contains("roomSlug")').filter('script').not('[type]').text();

								//Match roomSlug parameter and insert into JSON
								nbaStream.roomSlug = windowRoom.match(/"roomSlug": ".+"/)[0].replace(/[":]/g, '').replace("roomSlug ", '');

								//Match isBroadcasting  and insert into JSON
								nbaStream.isBroadcasting = windowRoom.match(/"isBroadcasting": [^,]+/g)[0].replace(/[":]/g, '').replace("isBroadcasting ", '');

								nbaStream.m3u8 = "https://video-cdn.streamup.com/app/" + nbaStream.roomSlug + "/playlist.m3u8"

								//console.log(nbaStream);

								nbaVideoURLs.push(nbaStream);
								//console.log(nbaVideoURLs.length);
								callback();


							} else {
								console.log(error);
								callback();
							}
						})
					} else {
						//console.log("cannot find attr for #su-ivp")
						callback();
					}


				} else {
					console.log(error);
					callback();
				}
			})
		} else {
			console.log(error);
			callback();
		}
	})
}

module.exports.requestHTML = requestHTML;