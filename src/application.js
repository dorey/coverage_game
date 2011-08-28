var main = $('div#main').eq(0);
$(window).resize(_.throttle(function(){
    var avail = $(window).height(),
        hh = $('header').height(),
        padding = 10,
        remaining = avail - (hh + padding);
    main.height(remaining);
}, 300))
    .trigger('resize');

window.r = Raphael(main.get(0), main.width(), main.height());


$.ajax({
    url: 'data/levelData.json',
    dataType: 'json',
    async: false
}).done(function(d){
    var level1dots = d[0].dots;
    Dots.makeDots.apply(this, level1dots);
});

var createFixedCircle = _.once(function(xy){
    var c = Circles.createCircle({
        xy: xy,
        rad: 25,
        statBox: true
    });
});

main.click(function(evt){
    createFixedCircle([evt.offsetX, evt.offsetY]);
});