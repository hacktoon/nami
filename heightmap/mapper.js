var canvas = document.getElementById("canvas")
    infoPanel = document.getElementById("info"),
    ctx = canvas.getContext("2d");

var TILESIZE = 2,
    GRID_WIDTH = 256,
    GRID_HEIGHT = 256;

var WATERLEVEL = 30,
    MIN_HEIGHT = 1,
    MAX_HEIGHT = 100,
    ROUGHNESS = 1.5,
    BORDER_OFFSET = 20;

var grid = Grid.new(GRID_WIDTH + 1, GRID_HEIGHT + 1, 0);

var world = {
    waterTiles: 0,
    landTiles: 0,
    edgeTiles: 0,

    isLand: function(grid, point){
        return grid.get(point) > WATERLEVEL;
    },

    isEdge: function(grid, point){
        var neighbours = GridNeighbourhood.moore(grid, point),
            waterTiles = neighbours.filter(function(point) {
                return grid.get(point) < WATERLEVEL;
            });
        return this.isLand(grid, point) && waterTiles.length > 0;
    },

    updateData: function(point, value) {
        if (this.isLand(grid, point)){
            this.landTiles += 1;
        } else {
            this.waterTiles += 1;
        }
    },

    toString: function() {
        var percent = function(value) {
                var percentage = (value * 100) / (GRID_WIDTH * GRID_HEIGHT);
                return Math.round(percentage) + '%';
            };

        return [
            "Land: " + this.landTiles + " = " + percent(this.landTiles),
            "Water: " + this.waterTiles + " = " + percent(this.waterTiles),
            "Edges: " + this.edgeTiles
        ].join('<br/>');
    }
};

var Fractal = (function(){
    var insideLandArea = function(grid, point) {
        var x = point.x,
            y = point.y,
            horz = x > BORDER_OFFSET && x < grid.width - BORDER_OFFSET,
            vert = y > BORDER_OFFSET && y < grid.height - BORDER_OFFSET;
        return horz && vert;
    };

    var averagePoints = function(points) {
        var valid = points.filter(function(val) { return Boolean(val); }),
            total = valid.reduce(function(sum, point) {
                return sum + grid.get(point);
            }, 0);
        return Math.round(total / valid.length);
    };

    return {
        setValue: function(value) {
            return clamp(value, MIN_HEIGHT, MAX_HEIGHT)
        },
        diamond: function(grid, point, size, offset){
            var x = point.x,
                y = point.y,
                height = MIN_HEIGHT,
                average = averagePoints([
                    Point.new(x, y - size),      // top
                    Point.new(x + size, y),      // right
                    Point.new(x, y + size),      // bottom
                    Point.new(x - size, y)       // left
                ]);

            if (insideLandArea(grid, point)){
                height = this.setValue(average + offset);
            }

            grid.set(point, height);
            world.updateData(point, height);
        },
        square: function(grid, point, size, offset){
            var x = point.x,
                y = point.y,
                height = MIN_HEIGHT,
                average = averagePoints([
                    Point.new(x - size, y - size),   // upper left
                    Point.new(x + size, y - size),   // upper right
                    Point.new(x + size, y + size),   // lower right
                    Point.new(x - size, y + size)    // lower left
                ]);

            if (insideLandArea(grid, point)){
                height = this.setValue(average + offset);
            }

            grid.set(point, height);
            world.updateData(point, height);
        },
        diamondSquare: function(grid){
            for(var size = grid.width - 1; size/2 >= 1; size /= 2){
                var half = size / 2,
                    scale = ROUGHNESS * size;

                for (var y = half; y < grid.width-1; y += size) {
                    for (var x = half; x < grid.width-1; x += size) {
                        var variance = Random.int(-scale, scale),
                            point = Point.new(x, y);
                        this.square(grid, point, half, variance);
                    }
                }
                for (var y = 0; y <= grid.width-1; y += half) {
                    for (var x = (y + half) % size; x <= grid.width-1; x += size) {
                        var variance = Random.int(-scale, scale),
                            point = Point.new(x, y);
                        this.diamond(grid, point, half, variance);
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


var draw = function(ctx, grid){


    grid.map(function(value, point){
        ctx.beginPath();

        if (value > WATERLEVEL) {
            ctx.fillStyle = "green";
        }

        if (value < WATERLEVEL){
            ctx.fillStyle = "#0056B9";
        }

        if (value < WATERLEVEL - 20){
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

        // if (value > WATERLEVEL+10 && value <= WATERLEVEL+12){
        //     ctx.fillStyle = "#E1D595";  //beach
        // }

        // if (value > WATERLEVEL+12){
        //     ctx.fillStyle = "darkseagreen";
        // }

        // if (value > WATERLEVEL+15){
        //     ctx.fillStyle = "darkgreen";
        // }

        // if (value >= MAX_HEIGHT-12){
        //     ctx.fillStyle = "green";
        // }

        // if (value == MAX_HEIGHT-2){
        //     ctx.fillStyle = "gray";
        // }
        // if (value == MAX_HEIGHT-1){
        //     ctx.fillStyle = "#DDD";
        // }

        ctx.fillRect(point.x * TILESIZE, point.y * TILESIZE, TILESIZE, TILESIZE);
    });
};

canvas.width = grid.width * TILESIZE;
canvas.height = grid.height * TILESIZE;

Fractal.generate(grid);

draw(ctx, grid);
infoPanel.innerHTML = world.toString();