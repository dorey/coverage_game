function log() {
	if(console !== undefined && console.log !== undefined) { console.log.apply(console, arguments); }
}
function warn() {
	if(console !== undefined && console.warn !== undefined) { console.warn.apply(console, arguments); throw(arguments[0]); }
}

function R(){ return r; } //because i need to find a better way to pass the raphael object to the modules

function circleStyle(chex) {
    var cs = {},
        c = Color(chex);
    cs.fill = c.clearer(0.75).rgbaString();
    cs.stroke = c.opaquer(0.5).rgbaString();
    return { raphAttr: cs };
}
function lineStyle(chex) {
    var cs = {},
        c = Color(chex);
    cs.fill = c.clearer(0.75).rgbaString();
    cs.stroke = c.opaquer(0.5).rgbaString();
    cs['stroke-width'] = 1.5;
    return { raphAttr: cs };
}

var CircleStyles = {
    normal: circleStyle("#1982a8"),
    selected: circleStyle("#125770")
};

var ConnectorStyles = {
    normal: lineStyle("#073436")
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
            .attr(style.raphAttr);
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
        _(carr).chain().pluck('_draw').all(_.identity)
            .value() && c.draw();
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

var StatBoxDisplaySettings = {
    leftPadding: 10
};

var StatBox = (function(){
    var active = false;
    var statRect;
    function _createStatRect(){
        var parentNode = $(R().canvas).parents().eq(0);
        statRect = $('<div />')
            .addClass('stat-box')
            .css({
                'position': 'absolute'
            })
            .appendTo(parentNode);
    }
    function recalcGridCoords(c, statRect){
        var bros = c.connectedCircles();
        bros.push(c);
        var coordVals = _.invoke(bros, 'attributes');
        var extremes = {
            maxX: Math.max.apply(Math, _.pluck(coordVals, 'xM')),
            maxY: Math.max.apply(Math, _.pluck(coordVals, 'yM')),
            minX: Math.min.apply(Math, _.pluck(coordVals, 'xm')),
            minY: Math.min.apply(Math, _.pluck(coordVals, 'ym'))
        };
        statRect.css({
            left: extremes.maxX + StatBoxDisplaySettings.leftPadding,
            top: extremes.minY
        })
    };
    var debounceRecalcGridCoords = _.debounce(recalcGridCoords, 50);
    function showForGrid(c, showingDots, totalDots) {
        statRect === undefined && _createStatRect();
        var sdl = showingDots.length,
            totl = totalDots.length,
            rate = Math.floor(1000 * sdl / totl) / 10,
            rateStr = "" + rate;
        var t = _.template("<p class='count'><span class='fw-number num'><%= showingCount %></span></p><p><span class='fw-number denom'><%= totalCount %></span> | <span class='fw-number pct'><%= rate %></span>%</p>")({
            showingCount: sdl,
            rate: rateStr,
            totalCount: totl
        });
        recalcGridCoords(c, statRect);
        statRect
            .html(t)
            .css({
            })
            .show();
    }
    function showForCircle(c, showingDots, totalDots){
        statRect === undefined && _createStatRect();
        var sdl = showingDots.length,
            totl = totalDots.length,
            rate = Math.floor(1000 * sdl / totl) / 10,
            rateStr = "" + rate + "";
        var t = _.template("<p class='count'><span class='fw-number num'><%= showingCount %></span></p><p><span class='fw-number denom'><%= totalCount %></span> | <span class='fw-number pct'><%= rate %></span>%</p>")({
            showingCount: sdl,
            rate: rateStr,
            totalCount: totl
        });
        statRect
            .html(t)
            .css({
                left: c.xy[0] + c.rad + StatBoxDisplaySettings.leftPadding,
                top: c.xy[1] - c.rad
            })
            .show();
    }
    function fadeBox(delay){
        _.delay(function(){
            statRect.fadeOut();
        }, delay);
    }
    return {
        showForCircle: showForCircle,
        showForGrid: showForGrid,
        fadeBox: fadeBox,
        active: active
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
        minRadius: 3,
        maxRadius: 50,
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
        this.adjustableRadius = !!o.adjustableRadius;
        this.minRadius = o.minRadius;
        this.maxRadius = o.maxRadius;
        this.style = o.style;
        this.fill = o.fill;
        this.stroke = o.stroke;
        this._id = _.uniqueId('circle');
        this.connected = false;
        this.connectors = {};
    }
    Circle.prototype.adjustRadius = function(rdelta) {
        if(!this.adjustableRadius || rdelta===0) {return;}
        this.rad = this.rad + rdelta;
        if(this.rad < this.minRadius) {
            this.rad = this.minRadius;
        } else if(this.rad > this.maxRadius) {
            this.rad = this.maxRadius;
        }
        if(this.rc.attrs.r !== this.rad) {
            this.rc.attr('r', this.rad);
            calcDotsForCircle(this);
        }
    }
    Circle.prototype.attributes = function(c) {
        return {
            // x: this.xy[0],
            // y: this.xy[1],
            xm: this.xy[0] - this.rad,
            ym: this.xy[1] - this.rad,
            xM: this.xy[0] + this.rad,
            yM: this.xy[1] + this.rad,
            radius: this.rad,
            _id: this._id
        };
    }
    Circle.prototype._addConnector = function(c) {
        this.connected = true;
        this.connectors[c.id] = c;
    };
    Circle.prototype.connectedCircles = function(all) {
        var chain = _(this.connectors).chain()
                .pluck('circles').flatten().unique();
        return !all ? chain.without(this).value() : chain.value();
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
    Circle.prototype.select = function(opts){
        if(opts===undefined) {opts = {};}
        !!opts.unique && _.invoke(selectedCircles(), 'unselect')
        var style = this.styleData('selected');
        this.rc
            .attr(style.raphAttr);
        this.selected = true;
    }
    Circle.prototype.unselect = function(){
        var style = this.styleData('normal');
        this.rc
            .attr(style.raphAttr);
        this.selected = false;
    }
    Circle.prototype.draw = function(){
        var hr = this.rad / 2;
        var style = this.styleData();
        this.rc = R()
            .circle(this.xy[0], this.xy[1], this.rad)
            .attr(style.raphAttr);
        calcDotsForCircle(this);
        this.select({unique:true});
    }
    Circle.prototype.changeXY = function(xDelta, yDelta) {
        this.xy = [
            this.xy[0] + xDelta,
            this.xy[1] + yDelta
            ];
        this.rc.attr({
            cx: this.xy[0],
            cy: this.xy[1]
        });
        this.connected && _.invoke(this.connectors, '_updatePath');
        calcDotsForCircle(this);
    }
    var calcDotsForCircle = _.throttle(function switchDots(circle){
        var dotsInC2 = Dots.inGrid(circle);
        _.each(Dots.list(), function(dot, i){
            if(_.include(dotsInC2, dot)) {
                dot.style = "covered";
            } else {
                dot.style = "normal";
            }
            dot.update();
        });
        StatBox.active && !circle.connected && StatBox.showForCircle(circle, dotsInC2, Dots.list());
        StatBox.active && circle.connected && StatBox.showForGrid(circle, dotsInC2, Dots.list());
    }, 25);
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
            calcDotsForCircle(this.npO);
        }
        function dragStart(x, y, evt){
            this.npO.select({unique: true, action:'dragging', evt: evt});
            this.cds = this.npO.containedDots();
            this.ox = this.attr('cx');
            this.oy = this.attr('cy');
        }
        function dragEnd(){
            this.npO.xy = [this.attr('cx'), this.attr('cy')];
            StatBox.active && StatBox.fadeBox(15000);
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

function dotStyle(chex, o, o2) {
    var cs = {},
        c = Color(chex);
    cs.stroke = c.clearer(o).rgbaString();
    cs.fill = c.clearer(o2).rgbaString()
    return { raphAttr: cs };
}

var DotStyles = {
    normal: dotStyle('#935fad', 0.25, 0.5),
    covered: dotStyle('#2e234d', 0, 0.5)
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
            .attr(style.raphAttr);
    }
    Dot.prototype.draw = function(){
        if (this.d === undefined) {
            this._createRaphaelDot();
        } else {
            var style = this.styleData();
            this.d.attr(style.raphAttr);
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
    function inGrid(c) {
        if(!c.connected) { return inCircle(c); }
        // get cached values for other circles, if they exist
        return _(c.connectedCircles(true)).chain()
                .map(Dots.inCircle)
                .flatten()
                .uniq()
                .value();
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
        inGrid: inGrid,
        list: list,
        clear: clear
    }
})();

var Events = (function(){
    function listenForArrows(cb){
        typeof cb === "function" && $('body').bind('keydown.updown', function(evt){
            if(evt.keyCode === 38) {
                cb.call(window, "up", evt)
            } else if(evt.keyCode === 40) {
                cb.call(window, "down", evt)
            } else if(evt.keyCode === 37){
                cb.call(window, "left", evt)
            } else if(evt.keyCode === 39){
                cb.call(window, "right", evt)
            }
        });
    }

    function clear() {
        $('body').unbind('keydown.updown');
    }

    return {
        listenForArrows: listenForArrows,
        clear: clear
    }
})();

var Nav = (function(){
    var rdiv,
        bs = [];

    function getNav(){
        var d = rdiv.find('.navigation');
        if(d.length===0) {
            d = $('<p />', {'class':'navigation'}).appendTo(rdiv);
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
        rdiv = $(_rd);
    }
    function draw(){
        var n = getNav();
        $(bs).each(function(i, x){
            button(x[0], x[1])
                .appendTo(n);
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