var test = require(".././server.js");

module.exports = function(app) {

	app.get('/', function(req, res) {
		res.render('index', { title: 'NBA Streams', nbaURLs : test.temp});
	});

	app.get('/scrape', function(req, res) {
		res.json(test.temp);

	});

}