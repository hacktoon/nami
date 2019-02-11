var discreteColorMap = function (terrainCode) {
    return {
        1: "#000056",
        2: "#1a3792",
        3: "#489CFF",
        4: "#0a5816",
        5: "#31771a",
        6: "#7ac85b",
        7: "#7d7553",
        8: "#AAA",
        9: "#FFF",
    }[terrainCode];
};

var isBeach = function (point) {
    var neighbors = PointNeighborhood.new(point),
        found = false;
    neighbors.adjacent(function (neighbor) {
        var isLand = grid.get(point) > world.seaLevel;
        //var hasWaterNeighbor = grid.get(neighbor) <= world.seaLevel;
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

        if (getViewOption() == "surface") {
            ctx.fillStyle = discreteColorMap(currentValue);
        } else {
            ctx.fillStyle = opts.colorMap[currentValue];
        }
        ctx.fillRect(x, y, tilesize, tilesize);
    });
};
