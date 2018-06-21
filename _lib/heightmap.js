
var MidpointDisplacement = function(p1, p2, roughness){
    var verticalDisplacement = (p1.y + p2.y) / 2,
        points = [p1, p2]
};


var HeightMap = function(gridSize, heightRange, roughness){
    var grid = Grid.new(gridSize + 1, gridSize + 1, undefined);

    var diamondSquare = function(grid){
        for(var size = grid.width - 1; size/2 >= 1; size /= 2){
            var half = size / 2,
                scale = roughness * size;

            for (var y = half; y < grid.width-1; y += size) {
                for (var x = half; x < grid.width-1; x += size) {
                    var variance = _.random(-scale, scale),
                        point = Point.new(x, y);
                    square(grid, point, half, variance);
                }
            }

            for (var y = 0; y <= grid.width-1; y += half) {
                for (var x = (y + half) % size; x <= grid.width-1; x += size) {
                    var variance = _.random(-scale, scale),
                        point = Point.new(x, y);
                    diamond(grid, point, half, variance);
                }
            }
        }
    };

    var diamond = function(grid, point, size, offset){
        var x = point.x,
            y = point.y,
            average = averagePoints([
                Point.new(x, y - size),      // top
                Point.new(x + size, y),      // right
                Point.new(x, y + size),      // bottom
                Point.new(x - size, y)       // left
            ]);
        pointHeight(point, average + offset);
    };

    var square = function(grid, point, size, offset){
        var x = point.x,
            y = point.y,
            average = averagePoints([
                Point.new(x - size, y - size),   // upper left
                Point.new(x + size, y - size),   // upper right
                Point.new(x + size, y + size),   // lower right
                Point.new(x - size, y + size)    // lower left
            ]);
        pointHeight(point, average + offset);
    };

    var averagePoints = function(points) {
        var values = points.map(function(point) {
            return grid.get(point);
        });
        return Math.round(_.sum(values) / values.length);
    };

    var pointHeight = function(point, height){
        var height = _.clamp(height, heightRange.start, heightRange.end);
        if (grid.inEdge(point)) {
            var oppositePoint = grid.oppositeEdge(point);
            grid.set(oppositePoint, height);
        }
        grid.set(point, height);
    };

    pointHeight(Point.new(0, 0), heightRange.start);
    pointHeight(Point.new(grid.width-1, 0), heightRange.start);
    pointHeight(Point.new(0, grid.height-1), heightRange.start);
    pointHeight(Point.new(grid.width-1, grid.height-1), heightRange.start);

    diamondSquare(grid);

    return grid;
};


