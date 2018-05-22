
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
        var sum = 0, count = 0;

        points.map(function(point) {
            var value = grid.get(point);
            if (value != undefined){
                sum += value;
                count++;
            }
        });
        return Math.round(sum / count);
    };

    var pointHeight = function(point, height){
        var height = _.clamp(height, heightRange.start, heightRange.end);
        if (grid.inEdge(point)) {
            var oppositePoint = grid.oppositeEdge(point);
            grid.set(oppositePoint, height);
        }
        grid.set(point, height);
    };

    var randInt = function() {
        return _.random(heightRange.start, heightRange.end);
    };

    pointHeight(Point.new(0, 0), randInt());
    pointHeight(Point.new(grid.width-1, 0), randInt());
    pointHeight(Point.new(0, grid.height-1), randInt());
    pointHeight(Point.new(grid.width-1, grid.height-1), randInt());

    diamondSquare(grid);

    return grid;
};


var smoothHeightMap = function(originalGrid) {
    var grid = _.cloneDeep(originalGrid);
    originalGrid.map(function(value, point) {
        var neighbours = GridNeighbourhood.vonNeumann(originalGrid, point);
        var sum = _.sumBy(neighbours, function(pt) {
            return originalGrid.get(pt);
        })
        grid.set(point, Math.round(sum / neighbours.length));
    });
    return grid;
};