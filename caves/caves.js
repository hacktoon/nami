

var TILESIZE = 5,
    ITERATIONS = 7,
    GRID_WIDTH = 100,
    GRID_HEIGHT = 100;

var canvas = document.getElementById('canvas'),
    shuffleButton = document.getElementById('shuffle');
    stepButton = document.getElementById('step');
    runButton = document.getElementById('run');

var ctx = canvas.getContext('2d'),
    grid = Grid.new(GRID_WIDTH, GRID_HEIGHT, 0);

canvas.width = GRID_WIDTH * TILESIZE;
canvas.height = GRID_HEIGHT * TILESIZE;


var shuffleGrid = function(grid, values){
    for(var y = 0; y < grid.height; y++){
        for(var x = 0; x < grid.width; x++){
            grid.set(Point.new(x, y), _.sample(values));
        }
    }
};


var run = function(grid) {
    var count = 0;
    while(count <= ITERATIONS){
        grid = step(grid);
        count++;
    }
    return grid;
};


var step = function(grid) {
    var new_grid = Grid.new(grid.width, grid.height, 0);

    grid.map(function(value, point) {
        var neighbours = Point.neighborHood(point, 'around'),
            count_one = count_zero = 0;

        neighbours.forEach(function(point) {
            var value = grid.get(point);
            if (value === 1){ count_one++ };
            if (value === 0){ count_zero++ };
        })

        new_grid.set(point, value);
        if (value == 1){
            if (count_one < 4) {
                new_grid.set(point, 0);
            }
        } else {
            if (count_one >= 5 || count_zero === 0) {
                new_grid.set(point, 1);
            }
        }
    });
    return new_grid;
};


var draw = function(grid, valueMap){
    var valueMap = valueMap || {};

    grid.map(function(value, point) {
        var tile = grid.get(point);
        ctx.fillStyle = tile ? 'black' : 'white';
        ctx.fillRect(point.x * TILESIZE, point.y * TILESIZE, TILESIZE, TILESIZE);
    });
};


shuffleButton.addEventListener('click', function(e) {
    shuffleGrid(grid, [0, 1]);
    draw(grid);
});

stepButton.addEventListener('click', function(e) {
    grid = step(grid);
    draw(grid);
});

runButton.addEventListener('click', function(e) {
    shuffleGrid(grid, [0, 1]);
    grid = run(grid);
    draw(grid);
});


shuffleGrid(grid, [0, 1]);
grid = run(grid);
draw(grid);