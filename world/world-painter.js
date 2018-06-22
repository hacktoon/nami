var drawMap = function(ctx, grid, opts){
    var opts = opts || {};

    grid.forEach(function(currentValue, point){
        opts.colorMap.forEach(function(item, index) {
            var range = Range.parse(item.range);
            if (range.contains(currentValue)){
                ctx.fillStyle = item.color;
            }
        });
        ctx.fillRect(point.x * TILESIZE, point.y * TILESIZE, TILESIZE, TILESIZE);
    });
};
