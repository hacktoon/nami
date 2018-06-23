var drawMap = function(ctx, grid, opts){
    var opts = opts || {};

    grid.forEach(function(currentValue, point){
        ctx.fillStyle = opts.colorMap[currentValue];
        ctx.fillRect(point.x * TILESIZE, point.y * TILESIZE, TILESIZE, TILESIZE);
    });
};