
var Point = (function () {
    var _Point = function (x, y) {
        this.x = x;
        this.y = y;

        this.hash = function () {
            return x + ',' + y;
        };
    };

    return {
        new: function (x, y) {
            return new _Point(x, y);
        },
        from: function (string) {
            var bits = string.replace(' ', '').split(','),
                x = _.parseInt(bits[0]),
                y = _.parseInt(bits[1]);

            return Point.new(x, y);
        },
        euclidianDistance: function (point1, point2) {
            var deltaX = Math.pow(point2.x - point1.x, 2),
                deltaY = Math.pow(point2.y - point1.y, 2);
            return Math.sqrt(deltaX + deltaY);
        },
        manhattanDistance: function (point1, point2) {
            var deltaX = Math.abs(point2.x - point1.x),
                deltaY = Math.abs(point2.y - point1.y);
            return deltaX + deltaY;
        }
    };
})();


var PointNeighborhood = (function () {
    var adjacent = {},
        diagonal = {};

    adjacent[Direction.NORTH] = { x: 0, y: -1 };
    adjacent[Direction.SOUTH] = { x: 0, y: 1 };
    adjacent[Direction.EAST] = { x: 1, y: 0 };
    adjacent[Direction.WEST] = { x: -1, y: 0 };

    diagonal[Direction.NORTHEAST] = { x: 1, y: 1 };
    diagonal[Direction.NORTHWEST] = { x: -1, y: 1 };
    diagonal[Direction.SOUTHEAST] = { x: 1, y: -1 };
    diagonal[Direction.SOUTHWEST] = { x: -1, y: -1 };

    var directions = {
        adjacent: adjacent,
        diagonal: diagonal,
        around: _.extend({}, adjacent, diagonal)
    };

    var _PointNeighborhood = function (referencePoint) {
        this.referencePoint = referencePoint;

        this.adjacent = function (callback) {
            return getNeighbors(directions.adjacent, referencePoint, callback);
        };

        this.diagonal = function (callback) {
            return getNeighbors(directions.diagonal, referencePoint, callback);
        };

        this.around = function (callback) {
            return getNeighbors(directions.around, referencePoint, callback);
        };

        this.atDirection = function (direction) {
            var around = directions.around;
            return createPoint(referencePoint, around[direction]);
        };
    };

    var getNeighbors = function (neighborType, referencePoint, callback) {
        var neighbors = [];

        _.each(neighborType, function (neighbor, direction) {
            var point = createPoint(referencePoint, neighbor);

            neighbors.push({ point: point, direction: direction });
            if (_.isFunction(callback)) {
                callback(point, direction);
            }
        });
        return neighbors;
    };

    var createPoint = function (point1, point2) {
        return Point.new(point1.x + point2.x, point1.y + point2.y);
    };

    return {
        new: function (referencePoint) {
            return new _PointNeighborhood(referencePoint);
        }
    };
})();


var PointMap = (function () {
    var _PointMap = function () {
        this._map = {};
        this._size = 0;

        this.add = function (point) {
            this._map[point.hash()] = point;
            this._size++;
        };

        this.has = function (point) {
            return _.has(this._map, point.hash());
        };

        this.get = function (hash) {
            return this._map[hash];
        };

        this.remove = function (point) {
            delete this._map[point.hash()];
            this._size--;
        };

        this.size = function () {
            return this._size;
        };

        this.each = function (callback) {
            _.each(this._map, callback);
        };
    };

    return {
        new: function () {
            return new _PointMap();
        }
    }
})();
