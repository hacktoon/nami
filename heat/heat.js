

var MidpointDisplacement = function (p1, p2, maxSize, roughness) {
    var points = Array(size),
        size = maxSize - 1,
        displacement = roughness * (size / 2);

    var buildPoint = function(p1, p2){
        if (p2.x - p1.x <= 1) return;
        var x = Math.floor((p1.x + p2.x) / 2),
            y = (p1.y + p2.y) / 2 + _.random(-displacement, displacement);
        y = _.clamp(Math.round(y), 0, maxSize-1);
        return Point.new(x, y);
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

    midpoint(p1, p2, size / 2);
    return points;
};


var HeatMap = (function(){
    var _Heat = function (size){
        var self = this;
        this.size = size;
        this.zones = {
            1: {height: 20, name: "Polar"},
            2: {height: 64, name: "Temperate"},
            3: {height: 96, name: "Subtropical"},
            4: {height: 160, name: "Tropical"},
            5: {height: 192, name: "Subtropical"},
            6: {height: 236, name: "Temperate"},
        };

        this.build = function(){
            _.each(self.zones, function(zone, code){
                var p1 = Point.new(0, zone.height),
                    p2 = Point.new(size-1, zone.height);
                zone.points = MidpointDisplacement(p1, p2, size, .08);
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
