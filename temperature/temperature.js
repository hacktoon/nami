
var Temperature = (function(){
    var _Temperature = function (size){
        var self = this;
        this.size = size;
        this.zones = {
            1: {name: "Polar"},
            2: {name: "Temperate"},
            3: {name: "Subtropical"},
            4: {name: "Tropical"}
        }
        this.points = [];

        this.createZoneLine = function(baseY, amplitude){
            var baseX = _.random(1, 5);

            var buildPoint = function(x){
                var y = baseY + calculateY(baseX);
                baseX += getFrequency();
                return Point.new(x, y);
            };

            var calculateY = function(x) {
                // a superposition of different sine functions
                var y = Math.sin(x) + Math.sin(x / 4) + Math.sin(x / 8);
                return Math.floor(y * amplitude);
            };

            var getFrequency = function(){
                if (_.sample([true, false])) return 0;
                return _.random(.2, .6, true);
            };

            _.times(self.size, function(count){
                var point = buildPoint(count);
                self.points.push(point);
            });
        };

        this.createZone = function(startY, endY, zoneInfo){

        };

        this.build = function(){
            self.createZoneLine(32, 1);
            self.createZoneLine(64, 1.5);
            self.createZoneLine(127, 2);
            self.createZoneLine(200, 3);

            self.createZone(0, 32, self.zones[1]);
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