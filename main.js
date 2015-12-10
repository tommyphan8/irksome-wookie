// Import
var express = require('express');
http = require("http");
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();




urlNBA = 'http://www.nbastream.net/';
urlLink = 'http://www.nbastream.net/chicago-bulls-at-boston-celtics-live-stream.html';
var temp = [];

app.get('/scrape', function(req, res) {
	createJSON();
	res.send('Check console!');
});



requestHTML(urlNBA, genLinks);
//requestURL(urlLink);
function createJSON() {
	var jsonArray = [];
	var json = {roomSlug: "", isBroadcasting : ""};

	var p1 = new Promise(function(resolve, reject) {
		
		console.log("Promise");
		for (i = 0; i < temp.length; i++) {
			json.roomSlug = temp[i].roomSlug;
			json.isBroadcasting = temp[i].isBroadcasting;
			jsonArray.push(json);
			//console.log(jsonArray);
		}
		resolve(jsonArray);

	});
		

	p1.then(function(result)  {
		console.log(JSON.stringify(jsonArray));
	}, function(err) {
		console.log(err);
	});


}


function requestHTML(url, callback) {
	
	var $;
	var links = [];

	request(url, function(error, response, html) {

		if(!error) {
			$ = cheerio.load(html);
			console.log($('.custom-box').contents().prevObject[0].children[1].children);



			// $('#featured').find('a').each(function(i, elem) {
			// 	if ($(this).attr('class') === undefined) {
			// 		links.push("http://" + response.connection._host + '/' + $(this).attr('href'));
			// 	}
			// });
			
			//callback(links);
		}
		else {
			console.log(error);
		}
	})

	
}

function genLinks(links) {

	for (i = 0; i < links.length; i++) {
		requestURL(links[i]);
	}
}


function requestURL(url, callback) {
	
	var $, link, roomSlug;
	var json = {roomSlug : "", isBroadcasting: ""};

	request(url, function(error, response, html) {
		if(!error) {
			$ = cheerio.load(html);
			link = "https://" + response.connection._host + "/" + $('#featured center iframe').attr('src');
			//console.log(link);
			request(link, function(error, response, html) {
				if(!error) {
					$ = cheerio.load(html);
					link = $('#su-ivp').attr('src')
					//console.log(link);
					if (link != undefined) {
						//console.log(link);
						request(link, function(error, response, html) {
							if(!error) {
								var windowRoom;
								$ = cheerio.load(html);
								
								//Grab script text for streamup API
								windowRoom = $('*:contains("roomSlug")').filter('script').not('[type]').text();

								//Match roomSlug parameter and insert into JSON
								json.roomSlug = windowRoom.match(/"roomSlug": ".+"/)[0].replace(/[":]/g,'').replace("roomSlug ",'');
								
								//Match isBroadcasting  and insert into JSON
								json.isBroadcasting = windowRoom.match(/"isBroadcasting": [^,]+/g)[0].replace(/[":]/g,'').replace("isBroadcasting ","");
								temp.push(json);
							}
							else  {
								console.log(error);
							}
						})
					}
				}
				else {
					console.log(error);
				}
			})
		}
		else {
			console.log(error);
		}
	})
}

//http.createServer(app).listen(8081);
app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;