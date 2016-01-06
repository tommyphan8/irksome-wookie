var cheerio = require('cheerio');
var request = require('request');


var sort = function(nbaURLs) {
	nbaURLs.sort(function (a, b) {
		if (time(a.time) > time(b.time)) {
			return 1;
		}
		if (time(a.time) < time(b.time)) {
			return -1;
		}
		return 0;
	});

}

var time = function(time) {
	var tempTime = time.time.split(':');
	//military time
	var newTime = {hour: Number(tempTime[0]), minute: tempTime[1]};

	if (time.amPM === "PM" && newTime.hour != 12) {
		newTime.hour += 12;
	}
	else if (time.amPM === 'AM' && newTime.hour === 12) {
		newTime.hour = 00;
	}
	// console.log(Number(String(newTime.hour).concat(newTime.minute)));
	return Number(String(newTime.hour).concat(newTime.minute));


}

var requestHTML = function(url, nbaVideoURLs) {
	var $;
	var nbaStream;
	

	request(url, function(error, response, html) {

		if (!error) {
			$ = cheerio.load(html);
			var numRunningQueries = 0;
			$('#featured').find('a').each(function(i, elem) {
				if ($(this).attr('class') === undefined) {
					++numRunningQueries;

					nbaStream = {
						url: "",
						time: {time: "", amPM: "", timeZone: "" },
						date: "",
						team1: "",
						team2: "",
						team1URL: "",
						team2URL: "",
						isBroadcasting: "",
						m3u8: "",
						roomSlug: ""
					};

					//parse URL for each game
					nbaStream.url = ("http://" + response.connection._host + '/' + $(this).attr('href'));

					
					nbaStream.time.time = $(this).children().eq(0).children().eq(0).children().eq(0).text();
					nbaStream.time.amPM = $(this).children().eq(0).children().eq(0).children().eq(1).children().eq(0).text().replace(/[\n  ]+/g, '');
					nbaStream.time.timeZone = $(this).children().eq(0).children().eq(0).children().eq(1).children().eq(1).text().replace(/[\n  ]+/g, '');
					//parse the date
					nbaStream.date = $(this).prevAll('h3').first().text();

					//parse the first team
					nbaStream.team1URL = "http://" + response.connection._host + '/' + $(this).children().eq(0).find('.box-images').eq(0).children().eq(0).attr('src');
					nbaStream.team2URL = "http://" + response.connection._host + '/' + $(this).children().eq(0).find('.box-images').eq(0).children().eq(2).attr('src');
					nbaStream.team1 = $(this).children().eq(0).find('.box-title').eq(0).text().replace(/\n/g, '').replace(/  +/g, '');

					//parase the second team
					nbaStream.team2 = $(this).children().eq(0).find('.box-title').eq(1).text().replace(/\n/g, '').replace(/  +/g, '');


					requestURL(nbaStream, nbaVideoURLs, function() {
						numRunningQueries--;
						//console.log(numRunningQue.notries);
						if (numRunningQueries === 0) {
							sort(nbaVideoURLs);
							//console.log(nbaVideoURLs);

							
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

								//console.log(windowRoom.match(/"roomSlug": ".+"/)[0]);
								
									
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