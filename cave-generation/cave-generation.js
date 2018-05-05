

var TILESIZE = 5,
    ITERATIONS = 7,
    GRID_WIDTH = 100,
    GRID_HEIGHT = 100;

var canvas = document.getElementById('canvas'),
    shuffleButton = document.getElementById('shuffle');
    stepButton = document.getElementById('step');
    runButton = document.getElementById('run');

var ctx = canvas.getContext('2d');

var grid = Grid.new(GRID_WIDTH, GRID_HEIGHT, 0);

canvas.width = GRID_WIDTH * TILESIZE;
canvas.height = GRID_HEIGHT * TILESIZE;

shuffleButton.addEventListener('click', function(e) {
    grid.shuffle([0, 1]);
    draw(grid);
});

stepButton.addEventListener('click', function(e) {
    grid = step(grid);
    draw(grid);
});

runButton.addEventListener('click', function(e) {
    grid.shuffle([0, 1]);
    grid = run(grid);
    draw(grid);
});

var run = function(grid) {
    var count = 0;
    while(count <= ITERATIONS){
        grid = step(grid);
        count++;
    }
    return grid;
}

var step = function(grid) {
    var new_grid = Grid.new(grid.width, grid.height, 0);
    grid.map(function(value, point) {
        var neighbours = grid.neighbours(point, {value: 1}),
            open_neighbours = grid.neighbours(point, {value: 0});
        new_grid.set(point, value);
        if (value == 1){
            if (neighbours.length < 4) {
                new_grid.set(point, 0);
            }
        } else {
            if (neighbours.length >= 5 || open_neighbours.length === 0) {
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

grid.shuffle([0, 1]);
grid = run(grid);
draw(grid);