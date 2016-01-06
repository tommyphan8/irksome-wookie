// Import
var express = require('express');
var app = express();
var misc = require('./scraper/scraper');
require('./routes/main')(app);

app.use('/public', express.static(__dirname + '/public')) ;

if (app.get('env') === 'development') {
	app.locals.pretty = true;
}
//Jade
app.set('views', './views');
app.set('view engine', 'jade');


//Global array of NBA Video URL JSON;
var nbaVideoURLs = [];
urlNBA = 'http://www.nbastream.net/';


//exports
module.exports.temp = nbaVideoURLs;

// var time = function() {
	
// 	var p1 = new Promise(function(resolve, reject) {
// 		nbaVideoURLs.length = 0;
// 		resolve("Success");
// 	});

// 	p1.then(function(value) {
// 		console.log(nbaVideoURLs);
// 		misc.requestHTML(urlNBA, nbaVideoURLs);
// 	});
	
// 	//1800000
// 	setInterval(time, 10000);
// }

//time();
misc.requestHTML(urlNBA, nbaVideoURLs);


//Start server and list on port 8081
var server = app.listen(8081, function() {
	console.log("Listening on port 8081")
});

