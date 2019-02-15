
var HeightMap = (function(){
    var _HeightMap = function (size, roughness){
        var self = this;
        this.grid = Grid.new(size, size);

        this.build = function (callback){
            setInitialPoints(callback);

            for(var midSize = size - 1; midSize/2 >= 1; midSize /= 2){
                var half = midSize / 2,
                    scale = roughness * midSize;

                for (var y = half; y < size-1; y += midSize) {
                    for (var x = half; x < size-1; x += midSize) {
                        var variance = _.random(-scale, scale),
                            point = Point.new(x, y);
                        square(callback, point, half, variance);
                    }
                }

                for (var y = 0; y <= size-1; y += half) {
                    for (var x = (y + half) % midSize; x <= size-1; x += midSize) {
                        var variance = _.random(-scale, scale),
                            point = Point.new(x, y);
                        diamond(callback, point, half, variance);
                    }
                }
            }
        };

        this.setPoint = function (callback, point, height) {
            var height = _.clamp(height, 0, size);
            if (self.grid.inEdge(point)) {
                var oppositeEdge = self.grid.oppositeEdge(point);
                self.grid.set(oppositeEdge, height);
            }
            self.grid.set(point, height);
            callback(height, point);
        };

        var setInitialPoints = function(callback) {
            self.setPoint(callback, Point.new(0, 0), _.sample([0, size]));
            self.setPoint(callback, Point.new(size - 1, 0), _.sample([0, size]));
            self.setPoint(callback, Point.new(0, size - 1), _.sample([0, size]));
            self.setPoint(callback, Point.new(size - 1, size - 1), _.sample([0, size]));
        };

        var diamond = function (callback, point, midSize, offset){
            var x = point.x,
                y = point.y,
                average = averagePoints([
                    Point.new(x, y - midSize),      // top
                    Point.new(x + midSize, y),      // right
                    Point.new(x, y + midSize),      // bottom
                    Point.new(x - midSize, y)       // left
                ]);
            self.setPoint(callback, point, average + offset);
        };

        var square = function (callback, point, midSize, offset){
            var x = point.x,
                y = point.y,
                average = averagePoints([
                    Point.new(x - midSize, y - midSize),   // upper left
                    Point.new(x + midSize, y - midSize),   // upper right
                    Point.new(x + midSize, y + midSize),   // lower right
                    Point.new(x - midSize, y + midSize)    // lower left
                ]);
            self.setPoint(callback, point, average + offset);
        };

        var averagePoints = function(points) {
            var values = points.map(function(point) {
                return self.grid.get(point);
            });
            return Math.round(_.sum(values) / values.length);
        };
    };

    return {
        new: function (size, roughness) {
            return new _HeightMap(size, roughness);
        }
    }
})();


var MidpointDisplacement = function (p1, p2, maxSize, roughness, callback) {
    var points = Array(size),
        size = maxSize - 1,
        displacement = roughness * (size / 2);

    var buildPoint = function (p1, p2) {
        if (p2.x - p1.x <= 1) return;
        var x = Math.floor((p1.x + p2.x) / 2),
            y = (p1.y + p2.y) / 2 + _.random(-displacement, displacement);
        y = _.clamp(Math.round(y), 0, maxSize - 1);
        return Point.new(x, y);
    };

    var midpoint = function (p1, p2, size) {
        var point = buildPoint(p1, p2);
        if (!point) return;
        points[point.x] = point;
        callback(point);
        displacement = roughness * size;
        midpoint(p1, point, size / 2);
        midpoint(point, p2, size / 2);
    }

    points[p1.x] = p1;
    callback(p1);
    points[p2.x] = p2;
    callback(p2);

    midpoint(p1, p2, size / 2);
    return points;
};
