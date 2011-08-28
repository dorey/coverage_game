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

var Circles = (function(){
    var circles = [],
        cidCount = 0;
    
    var circleDefaults = {
        rad: 10,
        style: 'normal',
        stroke: '#0f0',
        fill: 'rgba(0,255,0,0.2)'
    };
    function Circle(r, _o) {
        var o = $.extend({}, circleDefaults, _o);
        this.xy = o.xy;
        this.rad = o.rad;
        this.style = o.style;
        this.fill = o.fill;
        this.stroke = o.stroke;
        this._id = '_c' + ++cidCount;
    }
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
    function _inCircleCoords(crx, cry, crad, dx, dy) {
        var included = false;

        var yHemisphere = dy > cry,
            xDist = dx - crx,
            yMaxDist = Math.sqrt((crad * crad) - (xDist * xDist)),
            yTargetVal = crx + ((yHemisphere ? 1 : -1) * yMaxDist);
        if(yHemisphere) {
            included = dy <= yTargetVal;
        } else {
            included = dy >= yTargetVal;
        }
        return included;
    }

    function createCircle(r, opts) {
        var c = new Circle(r, opts);
        c.draw();
        circles.push(c);
        return c;
    }

    function selectedCircles(){
        return $(circles).filter(function(){
            return this.selected;
        });
    }

	return {
	    createCircle: createCircle,
	    selectedCircles: selectedCircles,
	    _inCircleCoords: _inCircleCoords,
	    list: function(){
	        return circles;
	    }
	};
})();

var DotStyles = {
    normal: {
        stroke: '#8f2fc6',
        fill: '#b796e0'
    },
    covered: {
        stroke: "#00f",
        fill: "#00f"
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
            .circle(this.xy[0] - hr, this.xy[1] - hr, hr * 2)
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
//        $(DotList).each(function(i,d){d.draw()});
    }
    function inCircle(c) {
        var x = c.xy[0],
            y = c.xy[1],
            rad = c.rad;
        var containedDots = [];
        var xmax = x + rad,
            xmin = x - rad,
            ymax = y + rad,
            ymin = y - rad;
        $(DotList).each(function(i, dot){
            var dx = dot.xy[0],
                dy = dot.xy[1];
            if (Circles._inCircleCoords(x, y, rad, dx, dy)) {
                containedDots.push(dot);
            }
        });
        return containedDots;
    }
    return {
        makeDots: makeDots,
        inCircle: inCircle
    }
})();