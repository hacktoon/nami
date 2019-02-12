
var ThermalMap = (function(){
    var _Thermal = function (size){
        var self = this,
            defaultValue = 0,
            roughness = .1;

        this.size = size;
        this.grid = Grid.new(size, size, defaultValue);
        this.idMap = {
            1: { height: 15,  color: "white",  name: "Polar"},
            2: { height: 60,  color: "blue",   name: "Temperate"},
            3: { height: 96,  color: "yellow", name: "Subtropical"},
            4: { height: 160, color: "red",    name: "Tropical"},
            5: { height: 196, color: "yellow", name: "Subtropical"},
            6: { height: 241, color: "blue",   name: "Temperate"},
            7: { height: 256, color: "white",   name: "Polar", fixedHeight: true}
        };

        this.build = function(){
            _.each(self.idMap, buildZones);
        };

        var buildZones = function(zone, code){
            var p1 = Point.new(0, zone.height),
                p2 = Point.new(size - 1, zone.height),
                setPoint = function(point) {
                    if (zone.fixedHeight) {
                        var point = Point.new(point.x, zone.height);
                    }
                    fillColumn(point, code);
                };
            MidpointDisplacement(p1, p2, self.size, roughness, setPoint);
        };

        var fillColumn = function(point, code){
            var baseY = point.y - 1;
            self.grid.set(point, code);
            while(baseY >= 0) {
                point = Point.new(point.x, baseY);
                if (self.grid.get(point) != defaultValue)
                    break;
                self.grid.set(point, code);
                baseY--;
            }
        };
    };

    return {
        new: function(size) {
            var thermal = new _Thermal(size);
            thermal.build();
            return thermal;
        }
    };
})();
