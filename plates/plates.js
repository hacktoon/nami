var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var TOP = 1,
    LEFT = 2,
    BOTTOM = 3,
    RIGHT = 4,
    TILESIZE = 5,
    NUM_PLATES = 10,
    GRID_WIDTH = 150,
    GRID_HEIGHT = 100;

var grid = Grid.new(GRID_WIDTH, GRID_HEIGHT, 0);

canvas.width = GRID_WIDTH * TILESIZE;
canvas.height = GRID_HEIGHT * TILESIZE;


var Plate = (function(){
    var _instanceID = 0,
        _plates = {};

    var _Plate = function(){
        this.id = undefined;
        this.area = [];
        this.speed = 5;
        this.weight = 10;
        this.direction = TOP;
    };

    return {
        _class: _Plate,
        new: function(weight, speed, direction){
            var plate = new _Plate();
            plate.id = _instanceID++;
            plate.weight = weight;
            plate.speed = speed;
            plate.direction = direction;

            _plates[plate.id] = plate;
            return plate;
        }
    };
})();



var floodfill = function(point) {

};


var choosePlatePoints = function(grid, numPoints) {
    var numPoints = numPoints || 1,
        platePoints = [];

    for(var i = 0; i < numPoints; i++){
        var point = Point.random(grid.width-1, grid.height-1);
        platePoints.push(point);
    };

    return platePoints;
};


var createPlates = function(grid, platePoints) {
    var scheduled = [],
        globalVisited = [];

    platePoints.map(function(point, index){
        var neighbours = GridNeighbourhood.vonNeumann(grid, point);

        neighbours.map(function(neighbourPoint){
            grid.set(neighbourPoint, 1);
            globalVisited.push(neighbourPoint);
        });

        grid.set(point, 1);
        globalVisited.push(point);
        scheduled = scheduled.concat(neighbours);
        //Log(point);
    });

};


var draw = function(grid){
    grid.map(function(value, point) {
        var value = grid.get(point);
        Log();
        ctx.fillStyle = value === 1 ? "forestgreen" : "lightblue";
        ctx.fillRect(point.x * TILESIZE, point.y * TILESIZE, TILESIZE, TILESIZE);
    });
};


var platePoints = choosePlatePoints(grid, NUM_PLATES);
createPlates(grid, platePoints);
draw(grid);
