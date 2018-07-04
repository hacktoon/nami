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
    plates = [];

var platesColorMap = (function() {
    var colors = [];
    _.times(NUM_PLATES, function() {
        colors.push(RandomColor());
    })
    return colors;
})();

var regionMap = {};

var Plate = (function(){

    var _Plate = function(id){
        this.id = id;
        this.points = [];
        this.speed = _.sample([1, 2, 3, 4, 5]);
        this.weight = _.sample([1, 2]);
        this.direction = _.sample([TOP, LEFT, RIGHT, BOTTOM]);
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

    _.times(totalPlates, function(i) {
        var plate = Plate.new(i);

        regionMap[i] = GridFill.new(grid, points[i], i);
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
    grid.reset();
    init();
};

var init = function() {
    plates = createPlates(grid, NUM_PLATES);
    plates.forEach(function(plate) {
        regionMap[plate.id].grow();
    });
};

generateButton.addEventListener('click', function() {
    reset();

    draw(grid);
});

resetButton.addEventListener('click', function() {
    reset();
    draw(grid);
});

growButton.addEventListener('click', function() {
    plates.forEach(function(plate) {
        regionMap[plate.id].grow();
    });
    draw(grid);
});

init();
draw(grid);