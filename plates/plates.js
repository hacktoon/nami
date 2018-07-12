var canvas = document.getElementById("surface"),
    ctx = canvas.getContext("2d"),
    totalPlatesInput = document.getElementById("totalPlates"),
    generateButton = document.getElementById("generate"),
    resetButton = document.getElementById("reset"),
    growButton = document.getElementById("grow"),
    drawEdgesOpt = document.getElementById("drawEdges");

var TILESIZE = 4;

var grid = Grid.new(128, 128),
    plates = [],
    platesColorMap = {},
    plateRegionMap = {};

var colorMap = function() {
    var colors = [];
    _.times(totalPlatesInput.value, function() {
        colors.push(RandomColor());
    })
    return colors;
};

var Plate = (function(){
    var _Plate = function(id){
        this.id = id;
        this.points = [];
        this.speed = _.sample([1, 2, 3, 4, 5]);
        this.weight = _.sample([1, 2]);
        this.direction = Direction.random();
    };

    return {
        _class: _Plate,
        new: function(id){
            return new _Plate(id);
        }
    };
})();

var createPlates = function(grid, totalPlates) {
    var points = grid.randomPoints(totalPlates),
        plates = [];

    _.times(totalPlates, function(index) {
        var plate = Plate.new(index);

        plateRegionMap[index] = GridFill.new(grid, points[index], index);
        plates.push(plate);
    });
    return plates;
};

var drawPoint = function(point, color) {
    var point = grid.wrap(point);
    ctx.fillStyle = color;
    ctx.fillRect(point.x * TILESIZE, point.y * TILESIZE, TILESIZE, TILESIZE);
};

var drawEdgesByDirection = function(direction, color) {
    var directionName = Direction.getName(direction).toLowerCase();
    _.values(plateRegionMap).forEach(function(region) {
        region[directionName+'Edges'].forEach(function(edgePoint) {
            var point = grid.wrap(edgePoint);
            ctx.fillStyle = color;
            ctx.fillRect(point.x * TILESIZE, point.y * TILESIZE, TILESIZE, TILESIZE);
        });
    });
};

var drawEdges = function() {
    _.values(plateRegionMap).forEach(function(region) {
        region.edges.forEach(function(edgePoint) {
            var point = grid.wrap(edgePoint);
            ctx.fillStyle = 'black';
            ctx.fillRect(point.x * TILESIZE, point.y * TILESIZE, TILESIZE, TILESIZE);
        });
    });
};

var draw = function(grid){
    canvas.width = grid.width * TILESIZE;
    canvas.height = grid.height * TILESIZE;

    grid.forEach(function(value, point) {
        var value = grid.get(point);
        ctx.fillStyle = platesColorMap[value] || '#FFF';
        ctx.fillRect(point.x * TILESIZE, point.y * TILESIZE, TILESIZE, TILESIZE);
    });
    if (drawEdgesOpt.checked){
        drawEdges();
    }
};

var grow = function(region) {
    region.grow();
};

var autoGrow = function() {
    var completed = 0,
        completedMap = {};

    while (completed != totalPlatesInput.value){
        plates.forEach(function(plate) {
            var region = plateRegionMap[plate.id];
            if (region.isComplete()) {
                completed += Boolean(completedMap[plate.id]) ? 0 : 1;
                completedMap[plate.id] = 1;
                return;
            }
            grow(region);
        });
    }
};

var reset = function() {
    grid.reset();
    plateRegionMap = {};
    init();
};

var init = function() {
    platesColorMap = colorMap();
    plates = createPlates(grid, totalPlatesInput.value);
};

generateButton.addEventListener('click', function() {
    reset();
    autoGrow();
    draw(grid);
});

resetButton.addEventListener('click', function() {
    reset();
    draw(grid);
});

growButton.addEventListener('click', function() {
    plates.forEach(function(plate) {
        plateRegionMap[plate.id].grow();
    });
    draw(grid);
});

init();
draw(grid);