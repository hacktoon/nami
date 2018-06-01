var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d"),
    generateButton = document.getElementById("generate");

var TOP = 1,
    LEFT = 2,
    BOTTOM = 3,
    RIGHT = 4,
    TILESIZE = 4,
    NUM_PLATES = 10;

var grid = Grid.new(128, 128);

canvas.width = grid.width * TILESIZE;
canvas.height = grid.height * TILESIZE;


var colorMap = {
    1: 'red',
    2: 'green',
    3: 'blue',
    4: 'wheat',
    5: 'orchid',
    6: 'grey',
    7: 'yellow',
    8: 'brown',
    9: 'indigo',
    10: 'purple'
};


var Plate = (function(){
    var _instanceID = 1,
        _plates = {};

    var _Plate = function(){
        this.id = undefined;
        this.points = [];
        this.speed = 5;
        this.weight = 10;
        this.direction = TOP;
    };

    return {
        _class: _Plate,
        new: function(weight, speed, direction){
            var plate = new _Plate();
            plate.id = _instanceID++;
            plate.weight = _.defaultTo(weight, 10);
            plate.speed = _.defaultTo(speed, 5);
            plate.direction = _.defaultTo(direction, TOP);
            _plates[plate.id] = plate;
            return plate;
        }
    };
})();


var createPlates = function(grid, numPoints) {
    var points = grid.randomPoints(numPoints),
        plates = [];

    points.forEach(function(point) {
        var plate = Plate.new();
        plate.points.push(point);
        plates.push(plate);
        grid.set(point, plate.id);
    });
    return plates;
};


var growPlate = function(grid, plate) {
    plate.points.forEach(function(point, index){
        var neighbours = GridNeighbourhood.vonNeumann(grid, point);

        neighbours.forEach(function(point, index){
            grid.set(point, plate.id);
        });
    });
};


var draw = function(grid){
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
    var plates = createPlates(grid, NUM_PLATES);
    plates.forEach(function(plate, index) {
        growPlate(grid, plate);
    })
    draw(grid);
};

generateButton.addEventListener('click', function() {
    generate();
});

generate();