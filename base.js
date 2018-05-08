var Log = console.log.bind(console);

var clamp = function(value, minValue, maxValue) {
    if (value > maxValue){ return maxValue; }
    if (value < minValue){ return minValue; }
    return value;
};

var Range = (function() {
    var _Range = function(){
        this.list = [];
        this.contains = function contains(number) {
            return this.start <= number && number <= this.end;
        };

        this.overlaps = function contains(range) {
            return this.end >= range.start || this.start <= range.end;
        };

        this.map = function map(callback) {
            for(var x = this.start; x <= this.end; x += this.step) {
                callback(x);
            }
        };
    };

    return {
        _class: _Range,

        new: function(start, end, step){
            var range = new _Range(),
                step = step || 1;

            if (end === undefined) {
                start = 0;
                end = start;
            }

            if (end > start){
                for(var i = start; i <= end; i += step) {
                    range.list.push(i);
                }
                return range;
            }

            for(var i = start; i >= end; i += step) {
                range.list.push(i);
            }
            return range;
        }
    };
})();

var Random = {
    _int: function(num){
        return parseInt(Math.random() * num, 10);
    },
    int: function(min, max){
        if (max < min){ return; }
        var arr = [];
        for(var i=min; i<=max; i++){
            arr.push(i);
        }
        return arr[this._int(arr.length)];
    },
    choice: function(values){
        var last_index = values.length-1;
            index = this.int(0, last_index);
        return values[index];
    }
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
        random: function(max_width, max_height){
            var x = Random.int(0, GRID_WIDTH),
                y = Random.int(0, GRID_HEIGHT);
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
        this.matrix = [],
        this.width = 0,
        this.height = 0,
        this.get = function(point){
            var x = point.x,
                y = point.y;
            if (y < 0 || y >= this.height || x < 0 || x >= this.width){
                return undefined;
            }
            return this.matrix[y][x];
        },
        this.set = function(point, value){
            var x = point.x,
                y = point.y;
            if (y < 0 || y >= this.height || x < 0 || x >= this.width){
                return;
            }
            this.matrix[y][x] = value;
        },
        this.shuffle = function(values){
            for(var y = 0; y < this.height; y++){
                for(var x = 0; x < this.width; x++){
                    this.set(Point.new(x, y), Random.choice(values));
                }
            }
        },
        this.map = function(callback){
            for(var y = 0; y < this.height; y++){
                for(var x = 0; x < this.width; x++){
                    callback(this.get(Point.new(x, y)), Point.new(x, y));
                }
            }
        }
    };

    return {
        _class: _Grid,
        new: function(width, height, default_value) {
            var grid = new _Grid(),
                default_value = default_value || 0;

            grid.width = width;
            grid.height = height;

            for(var y = 0; y < height; y++){
                grid.matrix.push([]);
                for(var x = 0; x < width; x++){
                    grid.matrix[y].push(default_value);
                }
            }
            return grid;
        }
    };
})();