
var HeatMap = (function(){
    var _Heat = function (size){
        var self = this;
        this.size = size;
        this.zones = {
            1: { height: 15, color: "white", name: "Polar" },
            2: { height: 60, color: "blue", name: "Temperate" },
            3: { height: 96, color: "orange", name: "Subtropical" },
            4: { height: 160, color: "red", name: "Tropical" },
            5: { height: 196, color: "orange", name: "Subtropical" },
            6: { height: 241, color: "blue", name: "Temperate" },
        };

        this.build = function(){
            _.each(self.zones, function(zone, code){
                var p1 = Point.new(0, zone.height),
                    p2 = Point.new(size-1, zone.height);
                zone.points = MidpointDisplacement(p1, p2, size, .1);
            });
        };
    };

    return {
        new: function(size) {
            var heat = new _Heat(size);
            heat.build();
            return heat;
        }
    };
})();
