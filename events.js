var Nav = (function(){
    function getNav(){
        var d = rd.find('.navigation');
        if(d.length===0) {
            d = $('<div />', {'class':'navigation'}).prependTo(rd);
        }
        return d;
    }
    function button(txt, evt){
        return $('<a />', {'class':'button'})
            .attr('href', '#')
            .text(txt)
            .click(function(){
                if(typeof evt === "function") {
                    evt.call(this, arguments);
                } else if(typeof evt === "string") {
                    eval(evt);
                }
            });
    }
    function start(_rd){
        var rd = _rd;
        var n = getNav()
            .empty();
        $(bs).each(function(i, x){
            n.append(button(x[0], x[1]))
        });
    }
    var bs = [];
    function addButton(t, fn){
        bs.push([t, fn]);
    }
    return {
        addButton: addButton,
        start: start
    }
})();

var Events = (function(){
    function drawCircles(r, rd){
        var svg = rd.find('svg');
        // svg.click(function(e){
        //     var xy = [
        //         e.offsetX,
        //         e.offsetY
        //     ];
        //     Circles.createCircle(r, xy);
        // });
    }
    function drawLine(s, e) {
        r.path("M"+s.join(',')+"L"+e.join(','))
    }
    return {
        drawCircles: drawCircles,
        drawLine: drawLine
    };
})();

var Modes = (function(){
    var curMode;

    function getMode(){
        return curMode;
    }
    function setMode(m) {
        curMode = m;
    }
    
    return {
        getMode: getMode,
        setMode: setMode
    };
})();