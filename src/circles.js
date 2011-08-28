function R(){ return r; } //because i need to find a better way to pass the raphael object to the modules

var CircleStyles = {
    normal: {
        stroke: '#00ff00',
        fill: 'rgba(0,255,0,0.2)'
    },
    selected: {
        stroke: '#f00',
        fill: 'rgba(255,0,0,0.2)'
    }
};

var ConnectorStyles = {
    normal: {
        stroke: '#f00'
    }
};

var Connectors = (function(){
    function Connector(id, circles, style){
        this.id = id;
        this.circles = circles;
        _.invoke(this.circles, '_addConnector', this)
        this.style = style;
    }
    Connector.prototype.styleData = function(str) {
        // if styleData receives a parameter, it sets the
        // style string before returning the style data.
        if (str !== undefined) { this.style = str; }
        return ConnectorStyles[this.style] || ConnectorStyles.normal;
    }

    function getDistanceBetweenCoords(coords) {
        var xDiff = Math.abs(coords[0][0] - coords[1][0]);
        var yDiff = Math.abs(coords[0][1] - coords[1][1]);
        return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    }
    Connector.prototype.coordinates = function(){
        return _.map(this.circles, function(circle, i){
            return circle.xy;
        });
    }
    Connector.prototype._calcDistance = function(){
        var coords = this.coordinates();
        this.distance = getDistanceBetweenCoords(coords);
    }
    Connector.prototype.coordPath = function() {
        var coords = this.coordinates();
        return 'M' + _.invoke(coords, 'join', ',').join('L');
    }
    Connector.prototype._createPath = function(){
        var style = this.styleData();
        this.path = R()
            .path(this.coordPath())
            .attr(style);
    }
    Connector.prototype._updatePath = function(){
        this.coords = undefined;
        this._calcDistance();
        this.path
            .attr('path', this.coordPath());
    }
    Connector.prototype.draw = function(){
        this.path === undefined && this._createPath();
    }

    var connectors = {};
    function join(carr){
        var cjId = _.pluck(carr, '_id').sort().join('-');
        var c = new Connector(cjId, carr);
        connectors[cjId] = c;
        c._calcDistance();
        // If all the circles are drawn, then draw the connector.
        _.all(_.pluck(carr, '_draw'), _.identity) &&
                c.draw();
        return c;
    }
    function clear() {
        connectors = {};
    }
    return {
        clear: clear,
        join: join
    }
})();

var Costs = (function(){
    var unit = '¢';
    function circleCost(c) {
        if(c.isGrid()) {
            return undefined;
        } else {
            return 123;
        }
    }
    function gridCost(c){
        if(!c.isGrid()) {
            return undefined;
        } else {
            return 123;
        }
    }
    return {
        unit: unit,
        circleCost: circleCost,
        gridCost: gridCost
    }
})();

var Circles = (function(){
    var circles = [],
        cidCount = 0,
        r, rd;
    
    var circleDefaults = {
        rad: 10,
        style: 'normal',
        stroke: '#0f0',
        fill: 'rgba(0,255,0,0.2)',
        draw: true,
        drag: true
    };
    
    function init(o) {
        r = o.r;
        rd = o.rd;
    }
    
    function Circle(_o) {
        var o = $.extend({}, circleDefaults, _o);
        this.xy = o.xy;
        this.rad = o.rad;
        this._draw = o.draw;
        this._drag = o.drag;
        this.style = o.style;
        this.fill = o.fill;
        this.stroke = o.stroke;
        this._id = _.uniqueId('circle');
        this.connected = false;
        this.connectors = {};
    }
    Circle.prototype._addConnector = function(c) {
        this.connected = true;
        this.connectors[c.id] = c;
    };
    Circle.prototype.isGrid = function(){
        return _.keys(this.connectors).length > 0;
    };
    Circle.prototype.styleData = function(str) {
        // if styleData receives a parameter, it sets the
        // style string before returning the style data.
        if (str !== undefined) { this.style = str; }
        return CircleStyles[this.style] || CircleStyles.normal;
    }
    Circle.prototype.select = function(){
        var style = this.styleData('selected');
        this.rc
            .attr(style);
            // .attr('stroke', '#f00')
            // .attr('fill', 'rgba(255,0,0,0.2)');
        this.selected = true;
    }
    Circle.prototype.unselect = function(){
        this.rc
            .attr('stroke', '#f00')
            .attr('fill', 'rgba(255,0,0,0.2)');
        this.selected = true;
    }
    Circle.prototype.draw = function(){
        var hr = this.rad / 2;
        var style = this.styleData();
        this.rc = R()
            .circle(this.xy[0], this.xy[1], this.rad)
            .attr(style);
    }
    Circle.prototype.listenDrag = function() {
        function dragMove(dx, dy){
            var newX = this.ox + dx,
                newY = this.oy + dy;
            this.attr({
                cx: newX,
                cy: newY
            });
            this.npO.xy = [newX, newY];
            this.npO.connected && _.invoke(this.npO.connectors, '_updatePath');
            (function switchDots(circle){
                var dotsInC2 = Dots.inCircle(circle);
                _.each(Dots.list(), function(dot, i){
                    if(_.include(dotsInC2, dot)) {
                        dot.style = "covered";
                    } else {
                        dot.style = "normal";
                    }
                    dot.update();
                });
            })(this.npO);
        }
        function dragStart(){
            this.cds = this.npO.containedDots();
            this.ox = this.attr('cx');
            this.oy = this.attr('cy');
        }
        function dragEnd(){
            this.npO.xy = [this.attr('cx'), this.attr('cy')];
        }
        if(this.rc !== undefined) {
            this.rc.npO = this;
            this.rc.drag(dragMove, dragStart, dragEnd);
        }
    }
    Circle.prototype.containedDots = function() {
        return Dots.inCircle(this);
    }
    function _inCircleCoords(crx, cry, crad, dx, dy) {
        var included = false;

        var yHemisphere = dy > cry,
            xDist = dx - crx,
            yMaxDist = Math.sqrt((crad * crad) - (xDist * xDist)),
            yTargetVal = cry + ((yHemisphere ? 1 : -1) * yMaxDist);
        if(yHemisphere) {
            included = dy <= yTargetVal;
        } else {
            included = dy >= yTargetVal;
        }
        return included;
    }

    function createCircle(opts) {
        var c = new Circle(opts);
        c._draw && c.draw();
        c._draw && c._drag && c.listenDrag();
        circles.push(c);
        return c;
    }

    function selectedCircles(){
        return $(circles).filter(function(){
            return this.selected;
        });
    }
    function clear() {
        circles = [];
    }

	return {
	    init: init,
	    createCircle: createCircle,
	    selectedCircles: selectedCircles,
	    _inCircleCoords: _inCircleCoords,
	    clear: clear,
	    list: function(){
	        return circles;
	    }
	};
})();

var DotStyles = {
    normal: {
        stroke: '#e9d5f4',
        fill: '#f1eaf9'
    },
    covered: {
        stroke: "#8f2fc6",
        fill: "#b796e0"
    }
};

var Dots = (function(){
    var DotList = [];
    var defaultDotOptions = {
        stroke: "#8f2fc6",
        fill: "#b796e0",
        style: 'normal'
    };
    function Dot(o){
        var opts = $.extend({}, defaultDotOptions, o);
        this.xy = opts.xy;
        this.style = opts.style;
        this.fill = opts.fill;
        this.stroke = opts.stroke;
    }
    Dot.prototype.styleData = function(str) {
        // if styleData receives a parameter, it sets the
        // style string before returning the style data.
        if (str !== undefined) { this.style = str; }
        return DotStyles[this.style] || DotStyles.normal;
    }
    Dot.prototype._createRaphaelDot = function(){
        var style = this.styleData();
        var hr = 1;
        this.d = R()
            .circle(this.xy[0], this.xy[1], hr * 2)
            .attr(style);
    }
    Dot.prototype.draw = function(){
        if (this.d === undefined) {
            this._createRaphaelDot();
        } else {
            var style = this.styleData();
            this.d.attr(style);
        }
    }
    Dot.prototype.update = Dot.prototype.draw;
    function makeDots(){
        _.each(arguments, function(dps, i){
            DotList.push(new Dot({
                xy: dps
            }));
        });
        _.invoke(DotList, 'draw');
    }
    function inCircle(c) {
        var x = c.xy[0],
            y = c.xy[1],
            rad = c.rad;
        var containedDots = [];
        $(DotList).each(function(i, dot){
            var dx = dot.xy[0],
                dy = dot.xy[1];
            if (Circles._inCircleCoords(x, y, rad, dx, dy)) {
                containedDots.push(dot);
            }
        });
        return containedDots;
    }
    function clear() {
        DotList = [];
    }
    function list() {
        return DotList;
    }
    return {
        makeDots: makeDots,
        inCircle: inCircle,
        list: list,
        clear: clear
    }
})();

var Events = (function(){
    function listenForUpDownArrows(cb){
        typeof cb === "function" && $('body').bind('keydown.updown', function(evt){
            if(evt.keyCode === 38) {
                cb.call(window, "up", evt)
            } else if(evt.keyCode === 40) {
                cb.call(window, "down", evt)
            }
        });
    }

    function clear() {
        $('body').unbind('keydown.updown');
    }

    return {
        listenForUpDownArrows: listenForUpDownArrows,
        clear: clear
    }
})();

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