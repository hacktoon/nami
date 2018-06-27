var canvas = document.getElementById("surface"),
    ctx = canvas.getContext("2d"),
    generateButton = document.getElementById("generate"),
    resetButton = document.getElementById("reset"),
    growButton = document.getElementById("grow");

var TOP = 1,
    LEFT = 2,
    BOTTOM = 3,
    RIGHT = 4,
    TILESIZE = 5,
    NUM_PLATES = 10;

var grid = Grid.new(128, 128),
    plates = [],
    scheduled = [],
    totalPoints = grid.width * grid.height,
    visitedPoints = 0;

var platesColorMap = (function() {
    var colors = [];
    _.times(NUM_PLATES, function() {
        colors.push(RandomColor());
    })
    return colors;
})();

var Plate = (function(){

    var _Plate = function(id, startPoint){
        this.id = id;
        this.points = [];
        this.edges = [startPoint];
        this.scheduled = [];
        this.speed = 5;
        this.weight = 10;
        this.direction = _.sample([TOP, LEFT, RIGHT, BOTTOM]);

        this.addPoint = function(point) {
            this.points.push(point);
        };

        this.grow = function(grid) {
            var newEdges = [],
                self = this;

            this.scheduled.forEach(function(point){
                var neighbours = Point.neighborHood(point, 'axials');

                neighbours.forEach(function(neighbour){
                    if (_.sample([true, false])){
                        grid.set(neighbour, self.id);
                        visitedPoints++;
                        newEdges.push(neighbour);
                    } else {
                        newEdges.push(point);
                    }
                });
            });
            this.scheduled = newEdges;
        };
    };

    return {
        _class: _Plate,
        new: function(id, startPoint){
            return new _Plate(id, startPoint);
        }
    };
})();

var createPlates = function(grid, numPoints) {
    var points = grid.randomPoints(numPoints),
        plates = [],
        id = 0;

    points.forEach(function(startPoint) {
        var plate = Plate.new(id++, startPoint);
        plate.scheduled.push(startPoint);
        grid.set(startPoint, plate.id);
        visitedPoints++;
        plates.push(plate);
    });
    return plates;
};

var draw = function(grid){
    canvas.width = grid.width * TILESIZE;
    canvas.height = grid.height * TILESIZE;

    grid.forEach(function(value, point) {
        var value = grid.get(point);
        ctx.fillStyle = platesColorMap[value] || 'lightblue';
        ctx.fillRect(point.x * TILESIZE, point.y * TILESIZE, TILESIZE, TILESIZE);
    });
};

var reset = function() {
    visitedPoints = 0;
    grid.reset();
    init();
};

var init = function() {
    plates = createPlates(grid, NUM_PLATES);
    plates.forEach(function(plate) {
        plate.grow(grid);
    });
};

generateButton.addEventListener('click', function() {
    reset();
    while(visitedPoints < totalPoints){
        plates.forEach(function(plate) {
            plate.grow(grid);
        });
    }
    draw(grid);
});

resetButton.addEventListener('click', function() {
    reset();
    draw(grid);
});

growButton.addEventListener('click', function() {
    plates.forEach(function(plate) {
        plate.grow(grid);
    });
    draw(grid);
});

init();
draw(grid);