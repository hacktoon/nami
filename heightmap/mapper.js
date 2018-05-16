var infoPanel = document.getElementById("info"),
    mapCanvas = document.getElementById("canvas"),
    generateButton = document.getElementById("generate"),
    waterlevelInput = document.getElementById("waterlevel"),
    mapCtx = mapCanvas.getContext("2d");

var UNSET = -1,
    TILESIZE = 2,
    GRID_WIDTH = 256,
    GRID_HEIGHT = 256;

var MIN_HEIGHT = 0,
    MAX_HEIGHT = 100,
    ROUGHNESS = 1.5;

var grid = Grid.new(GRID_WIDTH + 1, GRID_HEIGHT + 1, UNSET);

var world = {
    waterLevel: 50
};


var DiamondSquare = (function(){
    var averagePoints = function(points) {
        var sum = 0, count = 0;

        points.map(function(point) {
            var value = grid.get(point);
            if (value != undefined){
                sum += value;
                count++;
            }
        });
        return Math.round(sum / count);
    };

    return {
        setPoint: function(point, height){
            var height = _.clamp(height, MIN_HEIGHT, MAX_HEIGHT);
            if (grid.inEdge(point)) {
                var oppositePoint = grid.oppositeEdge(point);
                grid.set(oppositePoint, height);
            }
            grid.set(point, height);
        },
        generate: function(grid){
            var randInt = function() {
                return _.random(MIN_HEIGHT, MAX_HEIGHT);
            };
            this.setPoint(Point.new(0, 0), randInt());
            this.setPoint(Point.new(grid.width-1, 0), randInt());
            this.setPoint(Point.new(0, grid.height-1), randInt());
            this.setPoint(Point.new(grid.width-1, grid.height-1), randInt());

            this.diamondSquare(grid);
        },
        diamondSquare: function(grid){
            for(var size = grid.width - 1; size/2 >= 1; size /= 2){
                var half = size / 2,
                    scale = ROUGHNESS * size;

                for (var y = half; y < grid.width-1; y += size) {
                    for (var x = half; x < grid.width-1; x += size) {
                        var variance = _.random(-scale, scale),
                            point = Point.new(x, y);
                        this.square(grid, point, half, variance);
                    }
                }
                for (var y = 0; y <= grid.width-1; y += half) {
                    for (var x = (y + half) % size; x <= grid.width-1; x += size) {
                        var variance = _.random(-scale, scale),
                            point = Point.new(x, y);
                        this.diamond(grid, point, half, variance);
                    }
                }
            }
        },
        diamond: function(grid, point, size, offset){
            var x = point.x,
                y = point.y,
                average = averagePoints([
                    Point.new(x, y - size),      // top
                    Point.new(x + size, y),      // right
                    Point.new(x, y + size),      // bottom
                    Point.new(x - size, y)       // left
                ]);
            this.setPoint(point, average + offset);
        },
        square: function(grid, point, size, offset){
            var x = point.x,
                y = point.y,
                average = averagePoints([
                    Point.new(x - size, y - size),   // upper left
                    Point.new(x + size, y - size),   // upper right
                    Point.new(x + size, y + size),   // lower right
                    Point.new(x - size, y + size)    // lower left
                ]);
            this.setPoint(point, average + offset);
        }
    };
})();


var draw = function(ctx, grid){
    var copies = ['q1', 'q2', 'q3', 'q4'];

    grid.map(function(value, point){
        ctx.beginPath();

        if (value > world.waterLevel) {
            ctx.fillStyle = "#009000";
        }

        if (value > world.waterLevel+20) {
            ctx.fillStyle = "#009c00";
        }

        if (value < world.waterLevel){
            ctx.fillStyle = "#005fca";
        }

        if (value < world.waterLevel - 15){
            ctx.fillStyle = "#0052AF";
        }

        if (value >= MAX_HEIGHT - 3){
            ctx.fillStyle = "#BBB";
        }

        if (value >= MAX_HEIGHT - 2){
            ctx.fillStyle = "#DDD";
        }

        if (value == MAX_HEIGHT){
            ctx.fillStyle = "#FFF";
        }

        ctx.fillRect(point.x * TILESIZE, point.y * TILESIZE, TILESIZE, TILESIZE);
    });

    var mapImage = ctx.getImageData(0, 0, mapCanvas.width, mapCanvas.height);

    copies.forEach(function(id, index){
        var canvas = document.getElementById(id),
            copyCtx = canvas.getContext("2d");
        canvas.width = grid.width * TILESIZE/2;
        canvas.height = grid.height * TILESIZE/2;
        copyCtx.drawImage(mapCanvas, 0, 0, canvas.width, canvas.height);
    });
};

canvas.width = grid.width * TILESIZE;
canvas.height = grid.height * TILESIZE;

var generate = function() {
    DiamondSquare.generate(grid);
    draw(mapCtx, grid);
};

generateButton.addEventListener('click', generate);
waterlevelInput.addEventListener('change', function(){
    world.waterLevel = Number(waterlevelInput.value);
    draw(mapCtx, grid);
});

waterlevelInput.value = world.waterLevel;
generate();