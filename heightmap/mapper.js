var infoPanel = document.getElementById("info"),
    mapCanvas = document.getElementById("canvas"),
    mapCtx = mapCanvas.getContext("2d");

var UNSET = -1,
    TILESIZE = 2,
    GRID_WIDTH = 256,
    GRID_HEIGHT = 256;

var WATER_LEVEL = 50,
    MIN_HEIGHT = 0,
    MAX_HEIGHT = 100,
    ROUGHNESS = 1.5;

var grid = Grid.new(GRID_WIDTH + 1, GRID_HEIGHT + 1, UNSET);

var world = {
    waterTiles: 0,
    landTiles: 0,
    edgeTiles: 0,

    isEdge: function(grid, point){
        var neighbours = GridNeighbourhood.moore(grid, point),
            waterTiles = neighbours.filter(function(point) {
                return grid.get(point) < WATER_LEVEL;
            });
        return this.isLand(grid, point) && waterTiles.length > 0;
    },

    updateData: function(height) {
        if (height > WATER_LEVEL){
            this.landTiles += 1;
        } else {
            this.waterTiles += 1;
        }
    },

    toString: function() {
        var totalTiles = (grid.width * grid.height);
        var percent = function(value) {
                var percentage = (value * 100) / totalTiles;
                return Math.round(percentage) + '%';
            };

        return [
            "Land: " + this.landTiles + " = " + percent(this.landTiles),
            "Water: " + this.waterTiles + " = " + percent(this.waterTiles),
            "Edges: " + this.edgeTiles
        ].join('<br/>');
    }
};

var DiamondSquare = (function(){
    var averagePoints = function(points) {
            var valid = points.filter(function(val) { return Boolean(val); }),
                total = valid.reduce(function(sum, point) {
                    return sum + (grid.get(point) || 0);
                }, 0);
            return Math.round(total / valid.length);
        };

    return {
        setPoint: function(point, height){
            if (grid.inEdge(point)) {
                var oppositePoint = grid.oppositeEdge(point);
                grid.set(oppositePoint, height);
            }
            grid.set(point, height);
            world.updateData(height);
        },
        generate: function(grid){
            var randInt = function() {
                return Random.int(MIN_HEIGHT, MAX_HEIGHT);
            };
            this.setPoint(Point.new(0, 0), MIN_HEIGHT);
            this.setPoint(Point.new(grid.width-1, 0), MIN_HEIGHT);
            this.setPoint(Point.new(0, grid.height-1), MIN_HEIGHT);
            this.setPoint(Point.new(grid.width-1, grid.height-1), MIN_HEIGHT);

            this.diamondSquare(grid);
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
        diamond: function(grid, point, size, offset){
            var x = point.x,
                y = point.y,
                average = averagePoints([
                    Point.new(x, y - size),      // top
                    Point.new(x + size, y),      // right
                    Point.new(x, y + size),      // bottom
                    Point.new(x - size, y)       // left
                ]),
                height = this.pointHeight(average + offset, point);
            this.setPoint(point, height);
        },
        square: function(grid, point, size, offset){
            var x = point.x,
                y = point.y,
                average = averagePoints([
                    Point.new(x - size, y - size),   // upper left
                    Point.new(x + size, y - size),   // upper right
                    Point.new(x + size, y + size),   // lower right
                    Point.new(x - size, y + size)    // lower left
                ])
                ,height = this.pointHeight(average + offset, point);
            this.setPoint(point, height);
        },
        pointHeight: function(height, point) {
            var middlePoint = Point.new((grid.width-1) / 2,
                                        (grid.height-1) / 2),
                height = clamp(height, MIN_HEIGHT, MAX_HEIGHT),
                distance = Point.distance(point, middlePoint);

            return height;
        }

    };
})();


var draw = function(ctx, grid){
    var copies = ['q1', 'q2', 'q3', 'q4'];

    grid.map(function(value, point){
        ctx.beginPath();

        if (value > WATER_LEVEL) {
            ctx.fillStyle = "#009000";
        }

        if (value > WATER_LEVEL+20) {
            ctx.fillStyle = "#009c00";
        }

        if (value < WATER_LEVEL){
            ctx.fillStyle = "#005fca";
        }

        if (value < WATER_LEVEL - 15){
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

DiamondSquare.generate(grid);

draw(mapCtx, grid);
infoPanel.innerHTML = world.toString();