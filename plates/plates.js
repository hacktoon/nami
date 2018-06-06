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

var colorMap = {
    1: 'red',
    2: 'green',
    3: 'blue',
    4: 'wheat',
    5: 'orange',
    6: 'grey',
    7: 'yellow',
    8: 'brown',
    9: 'indigo',
    10: 'purple',
    11: 'indianred',
    12: 'teal',
    13: 'salmon',
    14: 'black',
    15: 'darkkhaki',
    16: 'aliceblue ',
    17: 'aqua',
    18: 'coral',
    19: 'darkolivegreen',
    20: 'darkseagreen'
};


var Plate = (function(){
    var _instanceID = 1;

    var _Plate = function(){
        this.id = undefined;
        this.points = [];
        this.scheduled = [];
        this.speed = 5;
        this.weight = 10;
        this.direction = _.sample([TOP, LEFT, RIGHT, BOTTOM]);
    };

    return {
        _class: _Plate,
        new: function(weight, speed, direction){
            var plate = new _Plate();
            plate.id = _instanceID++;
            plate.weight = _.defaultTo(weight, 10);
            plate.speed = _.defaultTo(speed, 5);
            plate.direction = _.defaultTo(direction, TOP);
            return plate;
        },
        reset: function() {
            _instanceID = 1;
        }
    };
})();


var createPlates = function(grid, numPoints) {
    var points = grid.randomPoints(numPoints),
        plates = [];

    points.forEach(function(point) {
        var plate = Plate.new();
        plate.scheduled.push(point);
        grid.set(point, plate.id);
        visitedPoints++;
        plates.push(plate);
    });
    return plates;
};


var growPlate = function(grid, plate) {
    var validNeighbours = [];

    plate.scheduled.forEach(function(point){
        var neighbours = grid.neighbours(point);

        neighbours.forEach(function(neighbourPoint){
            if (grid.get(neighbourPoint) != undefined) {
                return
            };
            if (_.sample([true, false])){
                grid.set(neighbourPoint, plate.id);
                visitedPoints++;
                validNeighbours.push(neighbourPoint);
            } else {
                validNeighbours.push(point);
            }
        });
    });
    plate.scheduled = validNeighbours;
};


var draw = function(grid){
    canvas.width = grid.width * TILESIZE;
    canvas.height = grid.height * TILESIZE;

    grid.map(function(value, point) {
        var value = grid.get(point);
        if (colorMap[value]){
            ctx.fillStyle = colorMap[value];
        } else {
            ctx.fillStyle = "lightblue";
        }
        ctx.fillRect(point.x * TILESIZE, point.y * TILESIZE, TILESIZE, TILESIZE);
    });
};


var generate = function() {
    plates = createPlates(grid, NUM_PLATES);
    plates.forEach(function(plate) {
        growPlate(grid, plate);
    });
};


var reset = function() {
    visitedPoints = 0;
    Plate.reset();
    grid.reset();
    generate();
};

generateButton.addEventListener('click', function() {
    reset();
    while(visitedPoints < totalPoints){
        plates.forEach(function(plate) {
            growPlate(grid, plate);
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
        growPlate(grid, plate);
    });
    draw(grid);
});

generate();
draw(grid);