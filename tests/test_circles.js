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
        xy: [50, 50],
        rad: 12
    });

    function testInSimpleCircleCoords(dx, dy, shouldBe) {
        equals(Circles._inCircleCoords(10, 10, 10, dx, dy), shouldBe,
            "Point ["+dx+", "+dy+"] should " +
                (shouldBe === false ? "NOT " : "") +
                "be in the circle [10, 10, 10]");
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
        xy: [300, 100],
        rad: 50
    });
    
    var l = [];
    function randUnder(n) { return Math.floor(Math.random()*n); }
    var dotCount = 20;
    for(var i=0; i<dotCount; i++) { l.push([ randUnder(600), randUnder(200) ]); }

    Dots.makeDots.apply(this, l);

    var dotsInC2 = Dots.inCircle(c2);
    _.each(dotsInC2, function(dot, i, dots){
        dot.style = "covered";
        dot.update();
    });
});