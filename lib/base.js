var Log = console.log.bind(console);

var canvasContextById = function(id) {
    var canvas = document.getElementById(id);
    return canvas.getContext("2d");
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


var Point = (function(){
    var _Point = function(x, y){
        this.x = x;
        this.y = y;
        this.hash = x + ', ' + y;
    };

    return {
        new: function(x, y){
            return new _Point(x, y);
        },
        add: function(p1, p2){
            return Point.new(p1.x + p2.x, p1.y + p2.y);
        },
        from: function(text){
            var bits = text.replace(' ', '').split(','),
                x = _.parseInt(bits[0]),
                y = _.parseInt(bits[1]);
            return Point.new(x, y);
        },
        euclidianDistance: function(point1, point2){
            var deltaX = Math.pow(point2.x - point1.x, 2),
                deltaY = Math.pow(point2.y - point1.y, 2);
            return Math.sqrt(deltaX + deltaY);
        },
        manhattanDistance: function(point1, point2){
            var deltaX = Math.abs(point2.x - point1.x),
                deltaY = Math.abs(point2.y - point1.y);
            return deltaX + deltaY;
        },
        neighborHood: function(point, type) {
            var type = type || 'axials',
                axials = [[0, 1], [0, -1], [1, 0], [-1, 0]],
                diagonals = [[1, 1], [1, -1], [-1, -1], [-1, 1]],
                neighbourCoordsByType = {
                    axials: axials,
                    diagonals: diagonals,
                    around: _.concat(axials, diagonals)
                };

            var _Point = function(coords){
                var x = point.x + coords[0],
                    y = point.y + coords[1];
                return Point.new(x, y);
            };

            return neighbourCoordsByType[type].map(_Point);
        }
    };
})();