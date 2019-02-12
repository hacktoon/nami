

var MidpointDisplacement = function (p1, p2, size, roughness) {
    var points = Array(size),
        size = size - 1,
        displacement = roughness * (size / 2);

    var buildPoint = function(p1, p2){
        if (p2.x - p1.x <= 1) return;
        var x = Math.floor((p1.x + p2.x) / 2),
            y = (p1.y + p2.y) / 2 + _.random(-displacement, displacement);
        return Point.new(x, Math.round(y));
    };

    var midpoint = function (p1, p2, size){
        var point = buildPoint(p1, p2);
        if (! point) return;
        points[point.x] = point;
        displacement = roughness * size;
        midpoint(p1, point, size / 2);
        midpoint(point, p2, size / 2);
    }

    points[p1.x] = p1;
    points[p2.x] = p2;

    midpoint(p1, p2, size/2);
    return points;
};


var HeatMap = (function(){
    var _Heat = function (size){
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

        };

        this.createZone = function(startY, endY, zoneInfo){

        };

        this.build = function(){
            var p1 = Point.new(0, 66),
                p2 = Point.new (256, 66);
            this.points = MidpointDisplacement(p1, p2, size, .15);
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
