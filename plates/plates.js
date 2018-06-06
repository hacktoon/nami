var canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d"),
    generateButton = document.getElementById("generate"),
    resetButton = document.getElementById("reset"),
    growButton = document.getElementById("grow");

var TOP = 1,
    LEFT = 2,
    BOTTOM = 3,
    RIGHT = 4,
    TILESIZE = 2,
    NUM_PLATES = 12;

var grid = Grid.new(256, 256),
    plates = [],
    scheduled = [],
    totalPoints = grid.width * grid.height,
    visitedPoints = 0;

var colors = [
    'red',
    'green',
    'blue',
    'wheat',
    'orange',
    'black',
    'yellow',
    'brown',
    'indigo',
    'purple',
    'indianred',
    'teal',
    'salmon',
    'grey',
    'darkkhaki',
    'aliceblue ',
    'aqua',
    'coral',
    'darkolivegreen',
    'darkseagreen'
];

var Plate = (function(){

    var _Plate = function(id){
        this.id = id;
        this.points = [];
        this.scheduled = [];
        this.speed = 5;
        this.weight = 10;
        this.priority = _.sample([1, 1, 1, 2]);
        this.direction = _.sample([TOP, LEFT, RIGHT, BOTTOM]);

        this.addPoint = function(point) {
            this.points.push(point);
        };

        this.grow = function(grid) {
            var validNeighbours = [],
                self = this;

            this.scheduled.forEach(function(point){
                var neighbours = grid.directNeighbours(point, function(point){
                    return grid.get(point) === undefined;
                });

                neighbours.forEach(function(neighbourPoint){
                    if (_.sample([true, false])){
                        grid.set(neighbourPoint, self.id);
                        visitedPoints++;
                        validNeighbours.push(neighbourPoint);
                    } else {
                        validNeighbours.push(point);
                    }
                });
            });
            this.scheduled = validNeighbours;
        };
    };

    return {
        _class: _Plate,
        new: function(id){
            return new _Plate(id);
        }
    };
})();

var createPlates = function(grid, numPoints) {
    var points = grid.randomPoints(numPoints),
        plates = [],
        id = 0;

    points.forEach(function(point) {
        var plate = Plate.new(id++);
        plate.scheduled.push(point);
        grid.set(point, plate.id);
        visitedPoints++;
        plates.push(plate);
    });
    return plates;
};

var draw = function(grid){
    canvas.width = grid.width * TILESIZE;
    canvas.height = grid.height * TILESIZE;

    grid.map(function(value, point) {
        var value = grid.get(point);
        if (colors[value]){
            ctx.fillStyle = colors[value];
        } else {
            ctx.fillStyle = "lightblue";
        }
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