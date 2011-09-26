var wrapCss = {
    width: 320,
    height: 140
};
var main = $('div#main').eq(0)
        .css(wrapCss);
/*$(window).resize(_.throttle(function(){
    var avail = $(window).height(),
        hh = $('header').height(),
        padding = 10,
        remaining = avail - (hh + padding);
    main.height(remaining);
}, 300))
    .trigger('resize'); */

window.r = Raphael(main.get(0), main.width(), main.height());


var levelData;
$.ajax({
    url: 'data/levelData.json',
    dataType: 'json',
    async: false
}).done(function(d){
    levelData = d;
});

// Nav.init('.nav');
// Nav.addButton("1: Single", "window.location.search='mode=1'");
// Nav.addButton("2: Grid", "window.location.search='mode=2'");
// Nav.addButton("4: Adjustable Grid", "window.location.search='mode=4'");
// Nav.addButton("5: Choose your poison", "window.location.search='mode=5'");
// Nav.draw();

var wSearchObj = (function(wls){
    if(wls==="" || wls===undefined) {return {};}
    var str = wls.replace(/^\?/, ""),
        o = {}, ss;
    _.each(str.split("&"), function(s){ ss = s.split("="); o[ss[0]] = ss[1]; });
    return o;
})(window.location.search);

var wmode = wSearchObj.mode || "1";

StatBox.active = true;

if(wmode === "1") {
    var level1dots = levelData[0].dots;
    Dots.makeDots.apply(this, level1dots);
    Nav.setPageTitle("Mode 1", "./?mode=1");
    var createFixedCircle = _.once(function(xy){
        var c = Circles.Circle({
            xy: xy,
            rad: 25,
            fixedRadius: true,
            style: 'c3'
        });
    });
    main.click(function(evt){
        var x = evt.offsetX || evt.layerX,
            y = evt.offsetY || evt.layerY;
        createFixedCircle([x,y]);
    });
} else if(wmode === "2") {
    Nav.setPageTitle("Mode 2", "./?mode=2");
    (function(){
        var level2dots = levelData[0].dots;
        Dots.makeDots.apply(this, level2dots);
        StatBox.active = true;
        var clickCount = 0;
        var cs = [];
        function createNode(xy){
            clickCount++;
            if(clickCount === 1) {
                cs[0] = Circles.Circle({
                    xy: xy,
                    rad: 20,
                    fixedRadius: true,
                    style: 'c1'
                });
            } else if(clickCount === 2) {
                cs[1] = Circles.Circle({
                    xy: xy,
                    rad: 20,
                    statBox: true,
                    fixedRadius: true,
                    style: 'c1'
                });
                Connectors.join(cs);
            }
        }
        main.click(function(evt){
            var x = evt.offsetX || evt.layerX;
            var y = evt.offsetY || evt.layerY;
            if (clickCount < 2) createNode([x, y]);
        });
    })();
} else if(wmode === "4") {
    Nav.setPageTitle("Mode 4", "./?mode=4");
    (function(){
        var level2dots = levelData[0].dots;
        Dots.makeDots.apply(this, level2dots);
        var clickCount = 0;
        var cs = [];
        function createNode(xy){
            clickCount++;
            if(clickCount === 1) {
                cs[0] = Circles.Circle({
                    xy: xy,
                    rad: 20,
                    adjustableRadius: true,
                    style: 'c2'
                });
            } else if(clickCount === 2) {
                cs[1] = Circles.Circle({
                    xy: xy,
                    rad: 20,
                    statBox: true,
                    adjustableRadius: true,
                    style: 'c2'
                });
                Connectors.join(cs);
            }
        }
        main.click(function(evt){
            var x = evt.offsetX || evt.layerX,
                y = evt.offsetY || evt.layerY;
            if (clickCount < 2) createNode([x, y]);
        });
    })();
} else if(wmode === "5") {
    Nav.setPageTitle("Mode 5", "./?mode=5");
    (function(p){
        var level2dots = levelData[0].dots;
        Dots.makeDots.apply(this, level2dots);
        $('<a />', {'text': 'Single'})
            .addClass('btn')
            .click(function(evt){
                main.bind('click.d1', function(evtI){
                    var xy = [evtI.offsetX || evtI.layerX,
                                evtI.offsetY || evtI.layerY];
                    var c = Circles.Circle({
                        xy: xy,
                        rad: 25,
                        fixedRadius: true,
                        style: 'c3'
                    });
                    main.unbind('click.d1');
                });
                evt.stopPropagation();
            }).appendTo(p);
        $('<a />', {text: 'Grid'})
            .addClass('btn')
            .click(function(evt){
                var clickCount = 0, cs = [];
                main.bind('click.d2', function(evtI){
                    clickCount++;
                    var xy = [evtI.offsetX || evtI.layerX,
                                evtI.offsetY || evtI.layerY];
                    if(clickCount === 1) {
                        cs[0] = Circles.Circle({
                            xy: xy,
                            rad: 20,
                            fixedRadius: true,
                            style: 'c1'
                        });
                    } else if(clickCount === 2) {
                        cs[1] = Circles.Circle({
                            xy: xy,
                            rad: 20,
                            statBox: true,
                            fixedRadius: true,
                            style: 'c1'
                        });
                        Connectors.join(cs);
                    } else {
                        main.unbind('click.d2');
                    }
                });
                evt.stopPropagation();
            }).appendTo(p);
        return p;
    })($('<p />')).appendTo($('#main'));
}

Events.listenForArrows(function(direction, evt){
    function multiplyIf(i, mult, tf) {
        return i * (!!tf ? mult : 1);
    }
    var circ = Circles.selectedCircles().get(0);
    if(circ === undefined) {
        return;
    } else if(evt.altKey) {
        if(_.indexOf(['up', 'down'], direction) == -1) {
            return;
        }
        var adj = 1;
        adj = multiplyIf(adj, 10, evt.shiftKey);
        adj = multiplyIf(adj, -1, direction==="down");
        return circ.adjustRadius(adj);
    }
    var x=0, y=0;
    if (direction === "up") y--;
    if (direction === "down") y++;
    if (direction === "left") x--;
    if (direction === "right") x++;
    x = x * (evt.shiftKey ? 10 : 1);
    y = y * (evt.shiftKey ? 10 : 1);
    Circles.selectedCircles().get(0).changeXY(x, y);
});
