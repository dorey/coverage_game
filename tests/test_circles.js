test("Circles", function(){
    Nav.addButton(
        'Mode: AddCircle',
        "Modes.setMode('addCircle')"
        );
    Nav.addButton(
        'Mode: SelectCircle',
        "Modes.setMode('selectCircle')"
        );
    Nav.start(rd);
    Events.drawCircles(r, rd);
    
    // Events.drawLine(
    //     [10,10],
    //     [100, 100]
    //     )

    equal(Modes.getMode(), undefined, "No mode is set");
    
    Modes.setMode('addCircle');
    equal(Modes.getMode(), 'addCircle', "Mode is properly set");

    var c = Circles.createCircle(r, {
        xy: [450, 50],
        rad: 10
    });

    function testInSimpleCircleCoords(dx, dy, shouldBe) {
        var ox = 2,
            oy = 1;
        var cc = [10 + ox, 10 + oy];
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

    ok(c !== undefined, "new circle is not undefined");
    equal(Circles.list().length, 1, "Circles.list() returns one circle.");
    equal(Circles.selectedCircles().length, 0, "No circle is marked as selected yet.");
    c.select();
    equal(Circles.selectedCircles().get(0)._id, c._id, "The circle is selected.");

    var c2 = Circles.createCircle(r, {
        xy: [50, 50],
        rad: 50
    });
    
    (function addRandomPoints(dotCount){
        var l = [];
        function randUnder(n) { return Math.floor(Math.random()*n); }
        for(var i=0; i<dotCount; i++) { l.push([ randUnder(600), randUnder(200) ]); }
        Dots.makeDots.apply(this, l);
    });//(20);

    (function addGridDots(x0, y0, xmax, ymax, spacing){
        var l = [];
        for(var x = x0; x <= xmax; x+= spacing) {
            for(var y = y0; y <= ymax; y+= spacing) {
                l.push([ x, y ]);
            }
        }
        Dots.makeDots.apply(this, l);
    })(0, 0, 100, 100, 10);

    var dotsInC2 = Dots.inCircle(c2);
    _.each(dotsInC2, function(dot, i, dots){
        dot.style = "covered";
        dot.update();
    });
});