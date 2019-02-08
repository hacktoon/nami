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

var discreteColorMap = function (currentValue) {
    color = "#000056";
    if (currentValue > 20) {
        color = "#1a3792";
    }

    if (currentValue > 40) {
        color = "#489CFF";
    }

    if (currentValue > world.seaLevel) {
        color = "#0a5816";
    }

    if (currentValue > world.seaLevel + 30) {
        color = "#0f8220";
    }

    if (currentValue > world.seaLevel + 50) {
        color = "#8abd34";
    }

    if (currentValue > world.seaLevel + 55) {
        color = "#7d7553";
    }

    if (currentValue > world.seaLevel + 66) {
        color = "#FFF";
    }
    return color;
};

var isBeach = function (point) {
    var neighbors = PointNeighborhood.new(point),
        found = false;
    neighbors.adjacent(function (neighbor) {
        var isLand = grid.get(point) > world.seaLevel;
        var hasWaterNeighbor = grid.get(neighbor) <= world.seaLevel;
        var diff = grid.get(point) - grid.get(neighbor);
        if (isLand && hasWaterNeighbor && diff < 8) {
            found = true;
            return
        }
    })
    return found;
};

var drawMap = function(ctx, grid, opts){
    var opts = opts || {},
        tilesize = getTileSize();

    canvas.width = world.size * tilesize;
    canvas.height = world.size * tilesize;

    grid.forEach(function(currentValue, point){
        var x = point.x * tilesize,
            y = point.y * tilesize;

        ctx.fillStyle = opts.colorMap[currentValue];
        if (getViewOption() == "surface") {
            ctx.fillStyle = discreteColorMap(currentValue);
        }

        ctx.fillRect(x, y, tilesize, tilesize);
    });
};
