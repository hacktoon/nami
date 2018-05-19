
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
            if (point.x === 0) { x = this.width - 1; }
            if (point.x === this.width - 1) { x = 0; }
            if (point.y === 0) { y = this.height - 1; }
            if (point.y === this.height - 1) { y = 0; }
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