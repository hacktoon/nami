
var Temperature = (function(){
    var _Temperature = function (size){
        var self = this;
        this.size = size;
        this.zones = {
            1: {name: "Polar"},
            2: {name: "Temperate"},
            3: {name: "Subtropic"},
            4: {name: "Tropic"}
        }
        this.points = [];

        this.createZoneEdge = function(yAxis){
            var x = _.sample([1, 2, 3, 4, 5]),
                amplitude = 1.5;

            var getFrequency = function(){
                return _.sample([.1, .2, .3, .4, .5, .6]);
            };

            var calculateY = function(x){
                var y = Math.sin(x) + Math.sin(x / 2) + Math.sin(x / 4);
                return Math.floor(y) * amplitude;
            };

            _.times(self.size, function(count){
                var y = yAxis + calculateY(x);
                    point = Point.new(count, y);
                x += getFrequency();
                self.points.push(point);
            });
        };

        this.build = function(){
            self.createZoneEdge(127);
        };
    };

    return {
        new: function(size) {
            var temperature = new _Temperature(size);
            temperature.build();
            return temperature;
        }
    };
})();