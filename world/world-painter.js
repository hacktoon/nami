var generateSurfaceColorMap = function() {
    var water = ColorGradient('000056', '489CFF', world.seaLevel),
        ground = ColorGradient('0a5816', 'bdff2e', world.heightRange.end - world.seaLevel + 1); // solve index problem on drawMap
    _.concat(water, ground).forEach(function(item, index) {
        heightmapColorMap[index] = item;
    });
};

var generateMoistureColorMap = function() {
    ColorGradient('CC0000', '0000CC', 100).forEach(function(item, index) {
        moistureColorMap[index] = item;
    });
};

var drawMap = function(ctx, grid, opts){
    var opts = opts || {},
        tSize = View.TILESIZE;

    mapCanvas.width = world.size * View.TILESIZE;
    mapCanvas.height = world.size * View.TILESIZE;

    var isBeach = function(point){
        var neighbors = PointNeighborhood.new(point);
        var found = false;
        neighbors.adjacent(function (neighbor) {
            var isLand = grid.get(point) > world.seaLevel;
            var isNeighborWater = grid.get(neighbor) <= world.seaLevel;
            var diff = grid.get(point) - grid.get(neighbor);
            if (isLand && isNeighborWater && diff < 7){
                found = true;
                return
            }
        })
        return found;
    };

    grid.forEach(function(currentValue, point){
        var x = point.x * tSize,
            y = point.y * tSize;

        ctx.fillStyle = opts.colorMap[currentValue];

        // if (currentValue >= 98) {
        //     ctx.fillStyle = "#FFF";
        // }
        // if (isBeach(point)) {
        //     ctx.fillStyle = "#f5e886";
        // }

        ctx.fillRect(x, y, tSize, tSize);

        // ctx.font = "12px Arial";
        // ctx.fillStyle = "black";
        // ctx.fillText(currentValue, x, y+20);
    });
};
