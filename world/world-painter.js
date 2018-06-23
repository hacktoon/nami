var generateWorldColorMap = function() {
    var water = ColorGradient('0052AF', '005FCA', world.waterLevel),
        ground = ColorGradient('008900', '00d000', 100 - world.waterLevel);
    _.concat(water, ground).forEach(function(item, index) {
        heightmapColorMap[index+1] = item;
    });
};

var generateMoistureColorMap = function() {
    ColorGradient('CC0000', '0000CC', 100).forEach(function(item, index) {
        moistureColorMap[index] = item;
    });
};

var drawMap = function(ctx, grid, opts){
    var opts = opts || {},
        tSize = interface.TILESIZE;

    grid.forEach(function(currentValue, point){
        ctx.fillStyle = opts.colorMap[currentValue];
        ctx.fillRect(point.x * tSize, point.y * tSize, tSize, tSize);
    });
};