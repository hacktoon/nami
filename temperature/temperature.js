
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

        this.createZoneLine = function(yAxis, amplitude){
            var x = _.random(1, 5);

            var getFrequency = function(){
                return _.random(.1, .5, true);
            };

            var calculateY = function(x){
                var y = Math.sin(x) + Math.sin(x / 4) + Math.sin(x / 8);
                return Math.floor(y * amplitude);
            };

            _.times(self.size, function(count){
                var y = yAxis + calculateY(x);
                    point = Point.new(count, y);
                x += getFrequency();
                self.points.push(point);
            });
        };

        this.build = function(){
            self.createZoneLine(32, 1);
            self.createZoneLine(64, 1.5);
            self.createZoneLine(127, 2);
            self.createZoneLine(200, 3);
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