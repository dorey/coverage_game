function createNav(){
    Nav.init(rd);
    Nav.addButton(
        'Mode: AddCircle',
        "Modes.setMode('addCircle')"
        );
    Nav.addButton(
        'Mode: SelectCircle',
        "Modes.setMode('selectCircle')"
        );
    Nav.draw();
}

module("Raphael Test", {
    setup: function(){
        _.invoke([Nav, R(), Circles, Dots],
            'clear');
        createNav();
    },
    teardown: function(){}
});

test("Circles", function(){
    var c = Circles.createCircle(r, {
        xy: [450, 50],
        rad: 10
    });
    ok(c !== undefined, "new circle is not undefined");
    equal(Circles.list().length, 1, "Circles.list() returns one circle.");
    equal(Circles.selectedCircles().length, 0, "No circle is marked as selected yet.");
    c.select();
    equal($(Circles.selectedCircles()).get(0)._id, c._id, "The circle is selected.");
});

test("Grid Points", function(){
    equal(Circles.list().length, 0, "No circles");
    var circle = Circles.createCircle(r, {
        xy: [50, 50],
        rad: 50
    });
    (function addGridDots(x0, y0, xmax, ymax, spacing){
        var l = [];
        for(var x = x0; x <= xmax; x+= spacing) {
            for(var y = y0; y <= ymax; y+= spacing) {
                l.push([ x, y ]);
            }
        }
        Dots.makeDots.apply(this, l);
    })(0, 0, 100, 100, 10);

    var dotsInC2 = Dots.inCircle(circle);
    _.each(dotsInC2, function(dot, i, dots){
        dot.style = "covered";
        dot.update();
    });
});

test("Random Points", function(){
    (function addRandomPoints(dotCount){
        var l = [];
        function randUnder(n) { return Math.floor(Math.random()*n); }
        for(var i=0; i<dotCount; i++) { l.push([ randUnder(600), randUnder(200) ]); }
        Dots.makeDots.apply(this, l);
    })(20);
});

test("Connect Circles", function(){
    var circles = [
        Circles.createCircle(r, { xy: [20, 20], rad: 10 }),
        Circles.createCircle(r, { xy: [60, 20], rad: 10 })
    ];
    var connector = Connectors.join(circles);
});

module("Math Tests", {});
test("Dot Circle Placement", function(){
    function testInSimpleCircleCoords(dx, dy, shouldBe) {
        // offsets x and y
        var ox = 2, oy = 1;
        var cc = [10 + ox, 10 + oy];
        // "Point [x, y] should be in circle [cx, cy, radius]"
        equals(shouldBe, Circles._inCircleCoords(10 + ox, 10 + oy, 10, dx + ox, dy + oy),
            "Point ["+ (dx + ox) +", "+ (dy + oy) +"] should " +
                (shouldBe === false ? "NOT " : "") +
                "be in the circle [" + cc[0] + ", " + cc[1] + ", 10]");
    }
    // the should-be-true values are on the border of the simple circle.
    // the should-be-false values are outside of the circle.
    testInSimpleCircleCoords(16, 2, true);
    testInSimpleCircleCoords(16, 1.9, false);
    testInSimpleCircleCoords(16, 18, true);
    testInSimpleCircleCoords(16, 18.1, false);
    testInSimpleCircleCoords(4, 18, true);
    testInSimpleCircleCoords(4, 18.1, false);
    testInSimpleCircleCoords(4, 2, true);
    testInSimpleCircleCoords(4, 1.9, false);
});

module("Modes", {});
test("Modes", function(){
    equal(Modes.getMode(), undefined, "No mode is set");
    Modes.setMode('addCircle');
    equal(Modes.getMode(), 'addCircle', "Mode is properly set");
});