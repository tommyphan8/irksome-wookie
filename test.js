$('#embed script').each(function(index) {
console.log(index + ":" + $(this).text());
})

var json = JSON.parse(document.getElementsByTagName('script').textContent)


$('*:contains("roomSlug")').not('[type]');

var a = $('script').not("[type], [id], [src]")

temp = $('*:contains("roomSlug")').filter('script').not('[type]')

eval(temp[0].text)

window.Room.roomSlug