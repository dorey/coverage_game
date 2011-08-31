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

Nav.init('header');
Nav.addButton("1: Single", "window.location.search='mode=1'");
Nav.addButton("2: Grid", "window.location.search='mode=2'");
Nav.addButton("4: Adjustable Grid", "window.location.search='mode=4'");
Nav.draw();

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
    
    var createFixedCircle = _.once(function(xy){
        var c = Circles.Circle({
            xy: xy,
            rad: 25,
            fixedRadius: true,
            style: 'c3'
        });
    });
    main.click(function(evt){
        createFixedCircle([
            evt.offsetX || evt.layerX,
            evt.offsetY || evt.layerY
            ]);
    });
} else if(wmode === "2") {
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
            if (clickCount < 2) { createNode([x, y]); }
        });
    })();
} else if(wmode === "4") {
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
            clickCount < 2 && createNode([
                evt.offsetX || evt.layerX,
                evt.offsetY || evt.layerY
                ]);
        });
    })();
}

Events.listenForArrows(function(direction, evt){
    function multiplyIf(i, mult, tf) {
        return i * (!!tf ? mult : 1);
    }
    var circ = Circles.selectedCircles().get(0);
    if(circ==undefined) {
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
    direction === "up" && y--;
    direction === "down" && y++;
    direction === "left" && x--;
    direction === "right" && x++;
    x = x * (evt.shiftKey ? 10 : 1);
    y = y * (evt.shiftKey ? 10 : 1);
    Circles.selectedCircles().get(0).changeXY(x, y);
});