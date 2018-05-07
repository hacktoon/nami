if (typeof Object.clone !== 'function'){
    Object.clone = function(obj){
       var F = function(){};
       F.prototype = obj;
       return new F();
    }
}


var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var log = console.log.bind(console);

var TILESIZE = 2;
var GRID_WIDTH = 257;
var GRID_HEIGHT = 257;

var WATERLEVEL = 45,
    MIN_HEIGHT = 1,
    MAX_HEIGHT = 100,
    ROUGHNESS = 1;


var grid = (function(w, h){
    var _grid = [];

    for(var i = 0; i < h; i++){
        _grid.push([]);
        for(var j = 0; j < w; j++){
            _grid[i].push(0);
        }
    }

    return {
        width: w,
        height: h,
        get: function(point){
            var x = point.x,
                y = point.y;
            if (y < 0 || y >= h || x < 0 || x >= w){
                return undefined;
            }
            return _grid[y][x];
        },
        set: function(point, val){
            var x = point.x,
                y = point.y;
            if (val > MAX_HEIGHT){
                val = MAX_HEIGHT;
            }
            if (val < MIN_HEIGHT){
                val = MIN_HEIGHT;
            }
            _grid[y][x] = val;
        }
    };
})(GRID_WIDTH, GRID_HEIGHT);


var Terrain = (function(){
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
                y = point.y;
            var value = this.average([
                grid.get(Point.new(x, y - size)),      // top
                grid.get(Point.new(x + size, y)),      // right
                grid.get(Point.new(x, y + size)),      // bottom
                grid.get(Point.new(x - size, y))       // left
            ]);
            grid.set(point, value + offset);
        },
        square: function(grid, point, size, offset){
            var x = point.x,
                y = point.y;
            var value = this.average([
                grid.get(Point.new(x - size, y - size)),   // upper left
                grid.get(Point.new(x + size, y - size)),   // upper right
                grid.get(Point.new(x + size, y + size)),   // lower right
                grid.get(Point.new(x - size, y + size))    // lower left
            ]);
            grid.set(point, value + offset);
        },
        diamondSquare: function(grid){
            for(var size = GRID_WIDTH - 1; size/2 >= 1; size /= 2){
                var half = size / 2,
                    scale = ROUGHNESS * size;

                for (var y = half; y < GRID_WIDTH-1; y += size) {
                    for (var x = half; x < GRID_WIDTH-1; x += size) {
                        var variance = Random.int(-scale, scale);
                        this.square(grid, Point.new(x, y), half, variance);
                    }
                }
                for (var y = 0; y <= GRID_WIDTH-1; y += half) {
                    for (var x = (y + half) % size; x <= GRID_WIDTH-1; x += size) {
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
            grid.set(Point.new(GRID_WIDTH-1, 0), randInt());
            grid.set(Point.new(0, GRID_HEIGHT-1), randInt());
            grid.set(Point.new(GRID_WIDTH-1, GRID_HEIGHT-1), randInt());

            this.diamondSquare(grid);
        },
    };
})();


var draw = function(grid){
    //desenha o cenario
    for(var i = 0; i < grid.width; i++){
        for(var j = 0; j < grid.height; j++){
            ctx.beginPath();
            ctx.fillStyle = "ForestGreen";
            var value = grid.get(Point.new(i, j));
            if (value < WATERLEVEL){
                ctx.fillStyle = "darkblue";
            }

            if (value >= WATERLEVEL && value <= WATERLEVEL+10){
                ctx.fillStyle = "blue";
            }

            if (value > WATERLEVEL+10 && value <= WATERLEVEL+15){
                ctx.fillStyle = "#E1D595";  //beach
            }

            if (value > WATERLEVEL+15){
                ctx.fillStyle = "darkgreen";
            }

            if (value >= MAX_HEIGHT-10){
                ctx.fillStyle = "gray";
            }
            if (value >= MAX_HEIGHT-5){
                ctx.fillStyle = "#DDD";
            }

            ctx.fillRect(i*TILESIZE, j*TILESIZE, TILESIZE, TILESIZE);

        }
    }
};

canvas.width = grid.width * TILESIZE;
canvas.height = grid.height * TILESIZE;

Terrain.generate(grid);

draw(grid);
