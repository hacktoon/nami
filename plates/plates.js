var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var TOP = 1,
    LEFT = 2,
    BOTTOM = 3,
    RIGHT = 4,
    TILESIZE = 4,
    NUM_PLATES = 10;

var grid = Grid.new(128, 128, undefined);

canvas.width = grid.width * TILESIZE;
canvas.height = grid.height * TILESIZE;


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



var floodfill = function(point) {

};


var randomPlatePoints = function(grid, numPoints) {
    var numPoints = numPoints || 1,
        platePoints = [];

    _.times(numPoints,function() {
        platePoints.push(grid.randomPoint());
    });

    return platePoints;
};


var createPlates = function(grid, totalPlates) {
    var platePoints = randomPlatePoints(grid, totalPlates);
    return platePoints.map(function(point) {
        var plate = Plate.new();
        plate.schedule(point);
        return plate;
    });
}

var growPlate = function(grid, plate) {
    var totalPoints = grid.width * grid.height,
        visitedPoints = 0,
        scheduled = [];

    platePoints.map(function(point, index){
        var plate = Plate.new();
        var neighbours = GridNeighbourhood.vonNeumann(grid, point);

        plates.push(plate);

        neighbours.map(function(neighbourPoint){
            grid.set(neighbourPoint, 1);
            globalVisited.push(neighbourPoint);
        });

        grid.set(point, plate.id);
        scheduled = scheduled.concat(neighbours);
    });
};


var draw = function(grid){
    grid.map(function(value, point) {
        var value = grid.get(point);
        ctx.fillStyle = value === 1 ? "forestgreen" : "lightblue";
        ctx.fillRect(point.x * TILESIZE, point.y * TILESIZE, TILESIZE, TILESIZE);
    });
};


var plates = createPlates(grid, NUM_PLATES);
draw(grid);
