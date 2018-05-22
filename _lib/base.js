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
                start = parseInt(args[0], 10),
                end = parseInt(args[1], 10),
                step = parseInt(args[2], 10);
            return new _Range(start, end, step || 1);
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