
var ThermalPainter = (function () {
    var _ThermalPainter = function (canvas) {
        var self = this;
        this.ctx = canvas.getContext("2d");

        this.draw = function(thermalMap, tilesize){
            self.ctx.globalAlpha = .3;

            thermalMap.grid.forEach(function (value, point) {
                var x = point.x * tilesize,
                    y = point.y * tilesize;

                self.ctx.fillStyle = thermalMap.zones[Number(value)].color;
                self.ctx.fillRect(x, y, tilesize, tilesize);
            });
        };

    };

    return {
        _class: _ThermalPainter,
        new: function (canvas) {
            return new _ThermalPainter(canvas);
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
