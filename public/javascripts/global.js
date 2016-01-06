var main = function(callback) {
	var nbaURLs

	$.getJSON('/scrape', function(data) {
		console.log(data);
		nbaURLs = data;
		callback(nbaURLs);

	});


};

var dom = function(nbaURLs) {
	$('#NBAURL .date h3').text(nbaURLs[0].date);

	nbaURLs.forEach(function(value, key) {
		$customBox = $('<div class=customBox></div>');
		$team1 = $('<span class=team1></span>').append('<span>' + value.team1 + '</span>').append('<img class=teamIMG src='+ value.team1URL+ '>');
		$team2 = $('<span class=team2></span>').append('<img class=teamIMG src='+ value.team2URL+ '>').append('<span>' + value.team2 + '</span>');
		$time = $('<div class=time> </div').append('<span>' + value.time.time + value.time.amPM + '</span>');
		if (value.isBroadcasting === 'false') {
			$watchNow = $('<div class=watchNow </div>').append('<span>OFFLINE</span>');
			console.log(value.isBroadcasting);
		} else {
			$watchNow = $('<div class=watchNow </div>').append('<a class=links id=' + key + ' href=#>Watch Now!</a>');
		}
		$('.games').append($customBox.append($time).append($team1).append($team2).append($watchNow).append('<p></p>'));
	});

	domVideo(nbaURLs);
}
var domVideo = function(nbaURLs) {
	var video;
	var hls;

	$('.links').click(function() {
		$temp = $(this);
		if (Hls.isSupported()) {
			video = document.getElementById('video');
			hls = new Hls();
			hls.attachMedia(video);

			hls.on(Hls.Events.MEDIA_ATTACHED, function() {

				console.log($temp.attr('id'));
				hls.loadSource(nbaURLs[$temp.attr('id')].m3u8);
				hls.on(Hls.Events.MANIFEST_PARSED, function() {
					video.play();
				});
			});

			hls.on(Hls.Events, function(event, data) {
				if (data.fatal) {
					switch (data.type) {
						case Hls.ErrorTypes.NETWORK_ERROR:
							// try to recover network error
							console.log("fatal network error encountered, try to recover");
							hls.startLoad();
							break;
						case Hls.ErrorTypes.MEDIA_ERROR:
							console.log("fatal media error encountered, try to recover");
							hls.recoverMediaError();
							break;
						default:
							// cannot recover
							hls.destroy();
							break;
					}
				}
			});
		};

		$('.title').append('<p>' + nbaURLs[$(this).attr('id')].team1 +
			" VS " + nbaURLs[$(this).attr('id')].team2 + '</p');
		$('.video').show();
		$('.customBox').hide();

	});

	$('.btnClose').click(function() {
		console.log('btnClose');
		hls.detachMedia();
		hls.destroy();

		$('.video').hide();
		$('.customBox').show();
		$('.title').text('');
	});
}

$(document).ready(function() {
	main(dom);

});