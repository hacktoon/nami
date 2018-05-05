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

var LEFT = 37;
var RIGHT = 39;
var UP = 38;
var DOWN = 40;

var TILESIZE = 2;
var GRID_WIDTH = 257;
var GRID_HEIGHT = 257;

var WATERLEVEL = 45,
    MIN_HEIGHT = 1,
    MAX_HEIGHT = 100,
    ROUGHNESS = 1;

var Tile = {
    x: 0,
    y: 0,
    value: 0
};

var Grid = (function(w, h){
    var _grid = [];

    for(var i = 0; i < h; i++){
        _grid.push([]);
        for(var j = 0; j < w; j++){
            var tile = Object.clone(Tile);
            tile.x = j;
            tile.y = i;
            tile.value = 0;
            _grid[i].push(tile);
        }
    }

    return {
        width: w,
        height: h,
        get: function(x, y){
            if (y < 0 || y >= h || x < 0 || x >= w){
                return {value: undefined};
            }
            return _grid[y][x];
        },
        set: function(x, y, val){
            if (val > MAX_HEIGHT){
                val = MAX_HEIGHT;
            }
            if (val < MIN_HEIGHT){
                val = MIN_HEIGHT;
            }
            _grid[y][x].value = val;
        },
        print: function(){
            for(var i = 0; i < h; i++){
                log(_grid[i].join(','));
            }
        }
    };
})(GRID_WIDTH, GRID_HEIGHT);

canvas.width = GRID_WIDTH * TILESIZE;
canvas.height = GRID_HEIGHT * TILESIZE;


var Rand = {
    int: function(num){
        return parseInt(Math.random() * num, 10);
    },
    choice: function(min, max){
        if (max < min){
            return;
        }
        var arr = [];
        for(var i=min; i<=max; i++){
            arr.push(i);
        }
        return arr[this.int(arr.length)];
    }
};

var Terrain = (function(){
    return {
        average: function(values) {
            var valid = values.filter(function(val) { return Boolean(val); });
            var total = valid.reduce(function(sum, val) { return sum + val; }, 0);
            return Math.round(total / valid.length);
        },
        diamond: function(grid, x, y, size, offset){
            var value = this.average([
                grid.get(x, y - size).value,      // top
                grid.get(x + size, y).value,      // right
                grid.get(x, y + size).value,      // bottom
                grid.get(x - size, y).value       // left
            ]);
            grid.set(x, y, value + offset);
        },
        square: function(grid, x, y, size, offset){
            var value = this.average([
                grid.get(x - size, y - size).value,   // upper left
                grid.get(x + size, y - size).value,   // upper right
                grid.get(x + size, y + size).value,   // lower right
                grid.get(x - size, y + size).value    // lower left
            ]);
            grid.set(x, y, value + offset);
        },
        diamondSquare: function(grid, nsize){
            for(var size = nsize; size/2 >= 1; size /= 2){
                var half = size / 2,
                    scale = ROUGHNESS * size;

                for (var y = half; y < GRID_WIDTH-1; y += size) {
                    for (var x = half; x < GRID_WIDTH-1; x += size) {
                        this.square(grid, x, y, half, Rand.choice(-scale, scale));
                    }
                }
                for (var y = 0; y <= GRID_WIDTH-1; y += half) {
                    for (var x = (y + half) % size; x <= GRID_WIDTH-1; x += size) {
                        this.diamond(grid, x, y, half, Rand.choice(-scale, scale));
                    }
                }
            }
        },
        generate: function(grid){
            grid.set(0, 0, MAX_HEIGHT);
            grid.set(GRID_WIDTH-1, 0, MAX_HEIGHT);
            grid.set(0, GRID_HEIGHT-1, MAX_HEIGHT);
            grid.set(GRID_WIDTH-1, GRID_HEIGHT-1, MAX_HEIGHT);

            this.diamondSquare(grid, GRID_WIDTH - 1);
        },
    };
})();


var draw = function(){
    //desenha o cenario
    for(var i = 0; i < GRID_WIDTH; i++){
        for(var j = 0; j < GRID_HEIGHT; j++){
            ctx.beginPath();
            ctx.fillStyle = "ForestGreen";
            var tile = Grid.get(i, j).value;
            if (tile < WATERLEVEL){
                ctx.fillStyle = "darkblue";
            }

            if (tile >= WATERLEVEL && tile <= WATERLEVEL+10){
                ctx.fillStyle = "blue";
            }

            if (tile > WATERLEVEL+10 && tile <= WATERLEVEL+15){
                ctx.fillStyle = "#E1D595";  //beach
            }

            if (tile > WATERLEVEL+15){
                ctx.fillStyle = "darkgreen";
            }

            if (tile >= MAX_HEIGHT-10){
                ctx.fillStyle = "gray";
            }
            if (tile >= MAX_HEIGHT-5){
                ctx.fillStyle = "#DDD";
            }

            ctx.fillRect(i*TILESIZE, j*TILESIZE, TILESIZE, TILESIZE);

        }
    }
};

Terrain.generate(Grid);

draw();
