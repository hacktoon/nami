var Log = console.log.bind(console);

var canvasContextById = function(id) {
    var canvas = document.getElementById(id);
    return canvas.getContext("2d");
};

var Direction = {
    NORTH: 1,
    EAST: 2,
    SOUTH: 3,
    WEST: 4,
    NE: 5,
    NW: 6,
    SE: 7,
    SW: 8,

    random: function() {
        return _.sample([
            this.NORTH,
            this.EAST,
            this.SOUTH,
            this.WEST,
            this.NE,
            this.NW,
            this.SE,
            this.SW,
        ]);
    }
};


var Range = (function(){
    var _Range = function(start, end, step){
        this.start = start;
        this.end = end;
        this.step = step;

        this.list = function() {
            return _.range(this.start, this.end + 1, this.step);
        };

        this.contains = function(number) {
            return number >= this.start && number <= this.end;
        };
    };

    return {
        _class: _Range,
        new: function(start, end, step){
            return new _Range(start, end, step || 1);
        },
        parse: function(template){
            var args = template.split(':'),
                start = _.toNumber(args[0]),
                end = _.toNumber(args[1]),
                step = _.toNumber(args[2]);
            return this.new(start, end, step);
        }
    };
})();


var Point = (function() {
    var _Point = function(x, y) {
        this.x = x;
        this.y = y;
    };

    return {
        new: function(x, y){
            return new _Point(x, y);
        },
        from: function(text) {
            var bits = text.replace(' ', '').split(','),
                x = _.parseInt(bits[0]),
                y = _.parseInt(bits[1]);
            return Point.new(x, y);
        },
        euclidianDistance: function(point1, point2) {
            var deltaX = Math.pow(point2.x - point1.x, 2),
                deltaY = Math.pow(point2.y - point1.y, 2);
            return Math.sqrt(deltaX + deltaY);
        },
        manhattanDistance: function(point1, point2) {
            var deltaX = Math.abs(point2.x - point1.x),
                deltaY = Math.abs(point2.y - point1.y);
            return deltaX + deltaY;
        },
        neighborHood: function(referencePoint, type, callback) {
            var type = type || 'axials',
                axials = [[0, 1], [0, -1], [1, 0], [-1, 0]],
                diagonals = [[1, 1], [1, -1], [-1, -1], [-1, 1]],
                coordinates = {
                    axials: axials,
                    diagonals: diagonals,
                    around: _.concat(axials, diagonals)
                },
                points = [];

            _.each(coordinates[type], function(coords){
                var x = referencePoint.x + coords[0],
                    y = referencePoint.y + coords[1],
                    point = Point.new(x, y);
                if (_.isFunction(callback)){
                    var direction = '';
                    callback(point);
                }
                points.push(point);
            });
            return points;
        }
    };
})();


var PointNeighborhood = (function() {
    var axial = [
        {dir: Direction.NORTH, x: 0, y: 1},
        {dir: Direction.SOUTH, x: 0, y: -1},
        {dir: Direction.EAST, x: 1, y: 0},
        {dir: Direction.WEST, x: -1, y: 0}
    ];

    var diagonal = [
        {dir: Direction.NE, x: 1, y: 1},
        {dir: Direction.NW, x: -1, y: 1},
        {dir: Direction.SE, x: 1, y: -1},
        {dir: Direction.SW, x: -1, y: -1}
    ];

    var neighborTypes = {
        axial: axial,
        diagonal: diagonal,
        around: _.concat(axial, diagonal)
    };

    var getNeighbors = function(type, referencePoint, callback) {
        var neighbors = [];

        _.each(neighborTypes[type], function(neighbor){
            var x = referencePoint.x + neighbor.x,
                y = referencePoint.y + neighbor.y,
                point = Point.new(x, y);

            neighbors.push({point: point, dir: neighbor.dir});
            if (_.isFunction(callback)){
                callback(point, neighbor.dir);
            }
        });
        return neighbors;
    };

    var _PointNeighborhood = function(referencePoint) {
        this.referencePoint = referencePoint;

        this.axial = function(callback) {
            return getNeighbors('axial', this.referencePoint, callback);
        };

        this.diagonal = function(callback) {
            return getNeighbors('diagonal', this.referencePoint, callback);
        };

        this.around = function(callback) {
            return getNeighbors('around', this.referencePoint, callback);
        };
    };

    return {
        new: function(referencePoint){
            return new _PointNeighborhood(referencePoint);
        }
    };
})();