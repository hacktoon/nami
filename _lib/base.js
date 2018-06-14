var Log = console.log.bind(console);

var canvasContextById = function(id) {
    var canvas = document.getElementById(id);
    return canvas.getContext("2d");
};

var getRandomColor = function() {
    var letters = '0123456789ABCDEF',
        color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

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
    var _Point = function(){
        this.x = 0;
        this.y = 0;

        this.hash = function() {
            return this.x + ',' + this.y;
        };
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
        }
    };
})();