
var HeatMap = (function(){
    var _Heat = function (size){
        var self = this,
            defaultValue = 0,
            roughness = .15;

        this.size = size;
        this.grid = new Grid(size, size, defaultValue);
        this.idMap = [
            { height: 15,  color: "white",  name: "Polar"},
            { height: 60,  color: "blue",   name: "Temperate"},
            { height: 96,  color: "yellow", name: "Subtropical"},
            { height: 160, color: "red",    name: "Tropical"},
            { height: 196, color: "yellow", name: "Subtropical"},
            { height: 241, color: "blue",   name: "Temperate"},
            { height: 256, color: "white",  name: "Polar"}
        ];

        this.build = function(){
            self.idMap.forEach(buildZones);
        };

        var buildZones = function(zone, code){
            var p1 = new Point(0, zone.height),
                p2 = new Point(size - 1, zone.height),
                setPoint = function(point) {
                    // is bottom zone, start filling up from max Y
                    if (code == self.idMap.length - 1) {
                        point.y = zone.height;
                    }
                    fillColumn(point, code);
                };
            MidpointDisplacement(p1, p2, self.size, roughness, setPoint);
        };

        var fillColumn = function(point, code){
            var baseY = point.y - 1;
            self.grid.set(point, code);
            while(baseY >= 0) {
                point = new Point(point.x, baseY);
                if (self.grid.get(point) != defaultValue)
                    break;
                self.grid.set(point, code);
                baseY--;
            }
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
