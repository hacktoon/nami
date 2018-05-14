var Log = console.log.bind(console);

var canvasContextById = function(id) {
    var canvas = document.getElementById(id);
    return canvas.getContext("2d");
};

var Tile = (function(){
    var _Tile = function(){
        this.value = 0;
        this.pivot = false;
    };

    return {
        _class: _Tile,
        new: function(value){
            var tile = new _Tile();
            tile.value = value;
            tile.pivot = false;
            return tile;
        }
    };
})();


var Point = (function(){
    var _Point = function(){
        this.x = 0;
        this.y = 0;
    };

    return {
        _class: _Point,
        new: function(x, y){
            var point = new _Point();
            point.x = x;
            point.y = y;
            return point;
        },
        add: function(p1, p2){
            return Point.new(p1.x + p2.x, p1.y + p2.y);
        },
        distance: function(p1, p2){
            var sum = Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
            return Math.sqrt(sum);
        },
        random: function(max_width, max_height){
            var x = _.random(0, GRID_WIDTH),
                y = _.random(0, GRID_HEIGHT);
            return this.new(x, y);
        }
    };
})();


var GridNeighbourhood = (function(){
    // four direct adjacents
    var _vonNeumann = [
        Point.new(0, 1),
        Point.new(0, -1),
        Point.new(1, 0),
        Point.new(-1, 0),
    ];

    // all eight adjacents
    var _moore = _vonNeumann.concat([
        Point.new(1, 1),
        Point.new(1, -1),
        Point.new(-1, -1),
        Point.new(-1, 1),
    ]);

    var _points = function(refPoints, grid, pivotPoint){
        return refPoints.map(function(point){
            return Point.add(pivotPoint, point);
        }).filter(function(point){
            return grid.get(point) != undefined;
        });
    };

    return {
        vonNeumann: function(grid, point){
            return _points(_vonNeumann, grid, point);
        },
        moore: function(grid, point){
            return _points(_moore, grid, point);
        }
    };

})();


var Grid = (function(){
    var _Grid = function(){
        this.matrix = [];
        this.width = 0;
        this.height = 0;

        this.get = function(point){
            var x = point.x,
                y = point.y;
            if (y < 0 || y >= this.height || x < 0 || x >= this.width){
                return undefined;
            }
            return this.matrix[y][x];
        };

        this.set = function(point, value){
            var x = point.x,
                y = point.y;
            if (y < 0 || y >= this.height || x < 0 || x >= this.width){
                return;
            }
            this.matrix[y][x] = value;
        };

        this.shuffle = function(values){
            for(var y = 0; y < this.height; y++){
                for(var x = 0; x < this.width; x++){
                    this.set(Point.new(x, y), _.sample(values));
                }
            }
        };

        this.map = function(callback){
            for(var y = 0; y < this.height; y++){
                for(var x = 0; x < this.width; x++){
                    callback(this.get(Point.new(x, y)), Point.new(x, y));
                }
            }
        };

        this.inEdge = function(point){
            var topLeft = point.x === 0 || point.y === 0,
                bottomRight = point.x === this.width - 1 ||
                              point.y === this.height - 1;
            return topLeft || bottomRight;
        };

        this.oppositeEdge = function(point){
            var x = point.x,
                y = point.y;
            if (! this.inEdge(point)) {
                throw new RangeError("Point not in edge");
            }
            if (point.x === 0) { x = grid.width - 1; }
            if (point.x === grid.width - 1) { x = 0; }
            if (point.y === 0) { y = grid.height - 1; }
            if (point.y === grid.height - 1) { y = 0; }
            return Point.new(x, y);
        };
    };

    return {
        _class: _Grid,

        new: function(width, height, default_value) {
            var grid = new _Grid(),
                default_value = default_value || 0;

            grid.width = width;
            grid.height = height;

            for(var y = 0; y < height; y++) {
                grid.matrix.push([]);
                for(var x = 0; x < width; x++){
                    grid.matrix[y].push(default_value);
                }
            }
            return grid;
        }
    };
})();