
var HeatMap = (function(){
    var _Heat = function (size){
        var self = this;
        this.size = size;
        this.grid = Grid.new(size, size, 1);
        this.zones = {
            1: { height: 15,  color: "blue",   name: "Temperate"},
            2: { height: 60,  color: "orange", name: "Subtropical"},
            3: { height: 96,  color: "red",    name: "Tropical"},
            4: { height: 160, color: "orange", name: "Subtropical"},
            5: { height: 196, color: "blue",   name: "Temperate"},
            6: { height: 241, color: "white",  name: "Polar"}
        };

        this.build = function(){
            _.each(self.zones, function(zone, code){
                var p1 = Point.new(0, zone.height),
                    p2 = Point.new(size-1, zone.height);
                zone.points = MidpointDisplacement(p1, p2, size, .1, function(point) {
                    self.grid.set(point, code);
                });
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
