// Import
var express = require('express');
var app = express();
var misc = require('./scraper/scraper');
require('./routes/main')(app);

//Jade
app.set('views', './views');
app.set('view engine', 'jade');

//Global array of NBA Video URL JSON;
var nbaVideoURLs = [];
urlNBA = 'http://www.nbastream.net/';


//exports
module.exports.temp = nbaVideoURLs;



misc.requestHTML(urlNBA, nbaVideoURLs);








//Start server and list on port 8081
var server = app.listen(8081, function() {
	console.log("Listening on port 8081")
});

