window.log = console.log.bind(console);

var canvasContextById = function(id) {
    var canvas = document.getElementById(id);
    return canvas.getContext("2d");
};

var Direction = (function(){
    var nameMap = {
        NORTH:     { code: 1,  symbol: "\u2191" },
        EAST:      { code: 2,  symbol: "\u2192" },
        SOUTH:     { code: -1, symbol: "\u2193" },
        WEST:      { code: -2, symbol: "\u2190" },
        NORTHEAST: { code: 3,  symbol: "\u2197" },
        NORTHWEST: { code: 4,  symbol: "\u2196" },
        SOUTHEAST: { code: -4, symbol: "\u2198" },
        SOUTHWEST: { code: -3, symbol: "\u2199" }
    };

    var codeMap = {};

    var buildEnumInterface = function(base){
        _.each(nameMap, function(obj, key){
            base[key] = obj.code;
            obj.name = key;
            codeMap[String(obj.code)] = obj;
        });
        return base;
    };

    return buildEnumInterface({
        getName: function(code) {
            return codeMap[String(code)].name;
        },

        getSymbol: function(code) {
            return codeMap[String(code)].symbol;
        },

        random: function() {
            return _.sample([
                this.NORTH,
                this.EAST,
                this.SOUTH,
                this.WEST,
                this.NORTHEAST,
                this.NORTHWEST,
                this.SOUTHEAST,
                this.SOUTHWEST,
            ]);
        },

        randomCardinal: function () {
            return _.sample([
                this.NORTH,
                this.EAST,
                this.SOUTH,
                this.WEST
            ]);
        }
    });
})();


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


var NumberInterpolation = function(from, to, totalItems){
    var totalNumbers = to - from + 1,
        stepValue = totalNumbers / totalItems,
        numbers = [from],
        currentValue = from;

    _.times(totalItems - 2, function(){
        currentValue += stepValue;
        numbers.push(Math.round(currentValue));
    });
    numbers.push(to);

    return numbers;
};


var Point = (function() {
    var _Point = function(x, y) {
        this.x = x;
        this.y = y;

        this.hash = function() {
            return x + ',' + y;
        };
    };

    return {
        new: function(x, y){
            return new _Point(x, y);
        },
        from: function(string) {
            var bits = string.replace(' ', '').split(','),
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
        }
    };
})();


var PointNeighborhood = (function() {
    var adjacent = {},
        diagonal = {};

    adjacent[Direction.NORTH] = {x: 0, y: -1};
    adjacent[Direction.SOUTH] = {x: 0, y: 1};
    adjacent[Direction.EAST] = {x: 1, y: 0};
    adjacent[Direction.WEST] = {x: -1, y: 0};

    diagonal[Direction.NORTHEAST] = {x: 1, y: 1};
    diagonal[Direction.NORTHWEST] = {x: -1, y: 1};
    diagonal[Direction.SOUTHEAST] = {x: 1, y: -1};
    diagonal[Direction.SOUTHWEST] = {x: -1, y: -1};

    var neighborTypes = {
        adjacent: adjacent,
        diagonal: diagonal,
        around: _.extend({}, adjacent, diagonal)
    };

    var _PointNeighborhood = function(referencePoint) {
        this.referencePoint = referencePoint;

        this.adjacent = function(callback) {
            return getNeighbors('adjacent', referencePoint, callback);
        };

        this.diagonal = function(callback) {
            return getNeighbors('diagonal', referencePoint, callback);
        };

        this.around = function(callback) {
            return getNeighbors('around', referencePoint, callback);
        };

        this.atDirection = function(direction) {
            var around = neighborTypes.around;
            return createPoint(referencePoint, around[direction]);
        };
    };

    var getNeighbors = function (type, referencePoint, callback) {
        var neighbors = [];

        _.each(neighborTypes[type], function (neighbor, direction) {
            var point = createPoint(referencePoint, neighbor);

            neighbors.push({ point: point, direction: direction });
            if (_.isFunction(callback)) {
                callback(point, direction);
            }
        });
        return neighbors;
    };

    var createPoint = function(point1, point2) {
        return Point.new(point1.x + point2.x, point1.y + point2.y);
    };

    return {
        new: function(referencePoint){
            return new _PointNeighborhood(referencePoint);
        }
    };
})();
