
var WorldPainter = (function () {
    var _WorldPainter = function (canvas) {
        var self = this;
        this.ctx = canvas.getContext("2d"),

        this.draw = function(grid, tilesize){
        };

    };

    return {
        _class: _WorldPainter,
        new: function (canvas) {
            return new _WorldPainter(canvas);
        }
    };
})();




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
