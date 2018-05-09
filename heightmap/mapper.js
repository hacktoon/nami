var canvas = document.getElementById("canvas")
    infoPanel = document.getElementById("info"),
    ctx = canvas.getContext("2d");

var TILESIZE = 2,
    GRID_WIDTH = 256,
    GRID_HEIGHT = 256;

var WATERLEVEL = 35,
    MIN_HEIGHT = 1,
    MAX_HEIGHT = 100,
    ROUGHNESS = 1.8,
    BORDER_OFFSET = 5;

var world = {
    waterTiles: 0,
    landTiles: 0,

    updateData: function(height) {
        if (height <= WATERLEVEL){
            this.waterTiles += 1;
        } else {
            this.landTiles += 1;
        }
    },

    toString: function() {
        return "Land: " + this.landTiles + ", Water: " + this.waterTiles;
    }
};


var grid = Grid.new(GRID_WIDTH + 1, GRID_HEIGHT + 1, 0);

var Terrain = (function(){
    var insideLandArea = function(grid, point) {
        var x = point.x,
            y = point.y,
            horz = x > BORDER_OFFSET && x < grid.width - BORDER_OFFSET,
            vert = y > BORDER_OFFSET && y < grid.height - BORDER_OFFSET;
        return horz && vert;
    };

    return {
        average: function(values) {
            var valid = values.filter(function(val) { return Boolean(val); });
            var total = valid.reduce(function(sum, val) {
                return sum + val;
            }, 0);
            return Math.round(total / valid.length);
        },
        diamond: function(grid, point, size, offset){
            var x = point.x,
                y = point.y,
                height = MIN_HEIGHT,
                average = this.average([
                    grid.get(Point.new(x, y - size)),      // top
                    grid.get(Point.new(x + size, y)),      // right
                    grid.get(Point.new(x, y + size)),      // bottom
                    grid.get(Point.new(x - size, y))       // left
                ]);

            if (insideLandArea(grid, point)){
                height = clamp(average + offset, MIN_HEIGHT, MAX_HEIGHT);
            }

            world.updateData(height);
            grid.set(point, height);
        },
        square: function(grid, point, size, offset){
            var x = point.x,
                y = point.y,
                height = MIN_HEIGHT,
                average = this.average([
                    grid.get(Point.new(x - size, y - size)),   // upper left
                    grid.get(Point.new(x + size, y - size)),   // upper right
                    grid.get(Point.new(x + size, y + size)),   // lower right
                    grid.get(Point.new(x - size, y + size))    // lower left
                ]);

            if (insideLandArea(grid, point)){
                height = clamp(average + offset, MIN_HEIGHT, MAX_HEIGHT);
            }

            world.updateData(height);
            grid.set(point, height);
        },
        diamondSquare: function(grid){
            for(var size = grid.width - 1; size/2 >= 1; size /= 2){
                var half = size / 2,
                    scale = ROUGHNESS * size;

                for (var y = half; y < grid.width-1; y += size) {
                    for (var x = half; x < grid.width-1; x += size) {
                        var variance = Random.int(-scale, scale);
                        this.square(grid, Point.new(x, y), half, variance);
                    }
                }
                for (var y = 0; y <= grid.width-1; y += half) {
                    for (var x = (y + half) % size; x <= grid.width-1; x += size) {
                        var variance = Random.int(-scale, scale);
                        this.diamond(grid, Point.new(x, y), half, variance);
                    }
                }
            }
        },
        generate: function(grid){
            var randInt = function() {
                return Random.int(MIN_HEIGHT, MAX_HEIGHT);
            };
            grid.set(Point.new(0, 0), randInt());
            grid.set(Point.new(grid.width-1, 0), randInt());
            grid.set(Point.new(0, grid.height-1), randInt());
            grid.set(Point.new(grid.width-1, grid.height-1), randInt());

            this.diamondSquare(grid);
        },
    };
})();


var draw = function(grid){
    //desenha o cenario

    grid.map(function(value, point){
        ctx.beginPath();
        ctx.fillStyle = "ForestGreen";

        if (value < WATERLEVEL){
            ctx.fillStyle = "darkblue";
        }

        if (value >= WATERLEVEL && value <= WATERLEVEL+10){
            ctx.fillStyle = "blue";
        }

        if (value > WATERLEVEL+10 && value <= WATERLEVEL+12){
            ctx.fillStyle = "#E1D595";  //beach
        }

        if (value > WATERLEVEL+12){
            ctx.fillStyle = "darkseagreen";
        }

        if (value > WATERLEVEL+15){
            ctx.fillStyle = "darkgreen";
        }

        if (value >= MAX_HEIGHT-12){
            ctx.fillStyle = "green";
        }

        if (value == MAX_HEIGHT-2){
            ctx.fillStyle = "gray";
        }
        if (value == MAX_HEIGHT-1){
            ctx.fillStyle = "#DDD";
        }
        if (value == MAX_HEIGHT){
            ctx.fillStyle = "#FFF";
        }

        ctx.fillRect(point.x * TILESIZE, point.y * TILESIZE, TILESIZE, TILESIZE);
    });
};

canvas.width = grid.width * TILESIZE;
canvas.height = grid.height * TILESIZE;

Terrain.generate(grid);

draw(grid);
infoPanel.innerHTML = world.toString();