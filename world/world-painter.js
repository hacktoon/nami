var generateSurfaceColorMap = function() {
    var water = ColorGradient('000056', '489CFF', world.seaLevel),
        ground = ColorGradient('0a5816', 'bdff2e', world.heightRange.end - world.seaLevel + 1); // solve index problem on drawMap
    _.concat(water, ground).forEach(function(item, index) {
        heightmapColorMap[index] = item;
    });
};

var generateMoistureColorMap = function() {
    ColorGradient('CC0000', '0000CC', world.size).forEach(function(item, index) {
        moistureColorMap[index] = item;
    });
};

var drawMap = function(ctx, grid, opts){
    var opts = opts || {},
        tilesize = getTileSize();

    canvas.width = world.size * tilesize;
    canvas.height = world.size * tilesize;

    var isBeach = function(point){
        var neighbors = PointNeighborhood.new(point);
        var found = false;
        neighbors.adjacent(function (neighbor) {
            var isLand = grid.get(point) > world.seaLevel;
            var hasWaterNeighbor = grid.get(neighbor) <= world.seaLevel;
            var diff = grid.get(point) - grid.get(neighbor);
            if (isLand && hasWaterNeighbor && diff < 8){
                found = true;
                return
            }
        })
        return found;
    };

    grid.forEach(function(currentValue, point){
        var x = point.x * tilesize,
            y = point.y * tilesize;

        ctx.fillStyle = opts.colorMap[currentValue];

        // if (currentValue > world.seaLevel) {
        //     ctx.fillStyle = "#0a5816";
        // }

        // if (currentValue > world.seaLevel + 30) {
        //     ctx.fillStyle = "#0f8220";
        // }

        // if (currentValue > world.seaLevel + 50) {
        //     ctx.fillStyle = "#8abd34";
        // }

        // if (currentValue > world.seaLevel + 60) {
        //     ctx.fillStyle = "#d0ff82";
        // }

        // if (isBeach(point)) {
        //     ctx.fillStyle = "#f5e886";
        // }

        ctx.fillRect(x, y, tilesize, tilesize);

        // ctx.font = "12px Arial";
        // ctx.fillStyle = "black";
        // ctx.fillText(currentValue, x, y+20);
    });
};
