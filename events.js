var Nav = (function(){
    var rdiv,
        bs = [];

    function getNav(){
        var d = rdiv.find('.navigation');
        if(d.length===0) {
            d = $('<div />', {'class':'navigation'}).prependTo(rdiv);
        }
        return d;
    }
    function clearNav() {
        $(rdiv).find('.navigation').empty();
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
    function addButton(t, fn){
        bs.push([t, fn]);
    }
    function clear() {
        clearNav();
        bs = [];
    }
    function init(_rd){
        rdiv = _rd;
    }
    function draw(){
        $(bs).each(function(i, x){
            button(x[0], x[1])
                .appendTo(rdiv);
        });
    }
    return {
        addButton: addButton,
        draw: draw,
        init: init,
        clear: clear
    }
})();

// var Events = (function(){
//     function drawCircles(r, rd){
//         var svg = rd.find('svg');
//         // svg.click(function(e){
//         //     var xy = [
//         //         e.offsetX,
//         //         e.offsetY
//         //     ];
//         //     Circles.createCircle(r, xy);
//         // });
//     }
//     function drawLine(s, e) {
//         r.path("M"+s.join(',')+"L"+e.join(','))
//     }
//     return {
//         drawCircles: drawCircles,
//         drawLine: drawLine
//     };
// })();

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