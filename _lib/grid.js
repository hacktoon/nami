
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
        return refPoints.map(function(refPoint){
            var point = Point.add(pivotPoint, refPoint),
                x = point.x,
                y = point.y;
            //use adjacent points in opposite grid side
            if (y < 0) { y = grid.height - y; }
            if (y >= grid.height) { y -= grid.height; }
            if (x < 0) { x = grid.width - x; }
            if (x >= grid.width) { x -= grid.width; }
            return Point.new(x, y);
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
                //throw new RangeError('Index out of range: ' + x + ', ' + y);
                return;
            }
            return this.matrix[y][x];
        };

        this.set = function(point, value){
            var x = point.x,
                y = point.y;
            if (y < 0 || y >= this.height || x < 0 || x >= this.width){
                //throw new RangeError('Index out of range: ' + x + ', ' + y);
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
            var isTopLeft = point.x === 0 || point.y === 0,
                isBottomRight = point.x === this.width - 1 ||
                              point.y === this.height - 1;
            return isTopLeft || isBottomRight;
        };

        this.oppositeEdge = function(point){
            var x = point.x,
                y = point.y;
            if (! this.inEdge(point)) {
                throw new RangeError("Point not in edge");
            }
            if (point.x === 0) { x = this.width - 1; }
            if (point.x === this.width - 1) { x = 0; }
            if (point.y === 0) { y = this.height - 1; }
            if (point.y === this.height - 1) { y = 0; }
            return Point.new(x, y);
        };

        this.randomPoint = function(){
            var x = _.random(0, this.width-1),
                y = _.random(0, this.height-1);
            return Point.new(x, y);
        };
    };

    return {
        _class: _Grid,

        new: function(width, height, default_value) {
            var grid = new _Grid();

            grid.width = width;
            grid.height = height;

            for(var y = 0; y < height; y++) {
                grid.matrix.push([]);
                for(var x = 0; x < width; x++){
                    grid.matrix[y].push(default_value);
                }
            }
            return grid;
        },
        str: function(grid){
            for(var y = 0; y < grid.height; y++) {
                Log(grid.matrix[y]);
            }
        }
    };
})();


var TileableGrid = (function(){
    var _TileableGrid = function(){
        this.grid = undefined;
        this.width = 0;
        this.height = 0;

        this.get = function(point){
            var x = point.x,
                y = point.y;
            if (x >= this.grid.width){ x %= this.grid.width; }
            if (y >= this.grid.height){ y %= this.grid.height; }
            if (x < 0){ x = this.grid.width - 1 - Math.abs(x+1) % this.grid.width; }
            if (y < 0){ y = this.grid.height - 1 - Math.abs(y+1) % this.grid.height; }
            return this.grid.get(Point.new(x, y));
        };

        this.set = function(point, value){
            var x = point.x,
                y = point.y;
            if (x >= this.grid.width){ x %= this.grid.width; }
            if (y >= this.grid.height){ y %= this.grid.height; }
            if (x < 0){ x = this.grid.width - 1 - Math.abs(x+1) % this.grid.width; }
            if (y < 0){ y = this.grid.height - 1 - Math.abs(y+1) % this.grid.height; }
            this.grid.set(Point.new(x, y), value);
        };

        this.map = function(callback){
            return this.grid.map(callback);
        };

        this.inEdge = function(point){
            return this.grid.inEdge(point);
        };

        this.oppositeEdge = function(point){
            return this.grid.oppositeEdge(point);
        };

        this.randomPoint = function(){
            return this.grid.randomPoint();
        };
    };

    return {
        _class: _TileableGrid,

        new: function(width, height, default_value) {
            var tileableGrid = new _TileableGrid(),
                grid = Grid.new(width, height, default_value);
            tileableGrid.grid = grid;
            tileableGrid.matrix = grid.matrix;
            tileableGrid.width = grid.width;
            tileableGrid.height = grid.height;
            return tileableGrid;
        }
    };
})();