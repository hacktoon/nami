
var HeatPainter = (function () {
    var _HeatPainter = function (canvas) {
        var self = this;
        this.ctx = canvas.getContext("2d");

        this.drawLines = function (points, color, tilesize){
            _.each(points, function (point) {
                var x = point.x * tilesize,
                    y = point.y * tilesize;

                self.ctx.fillStyle = color;
                self.ctx.fillRect(x, y, tilesize, tilesize);
            });
        };

        this.draw = function(heatMap, tilesize){
            canvas.width = heatMap.size * tilesize;
            canvas.height = heatMap.size * tilesize;

            _.each(heatMap.zones, function (zone) {
                self.drawLines(zone.points, zone.color, tilesize);
            });
        };

    };

    return {
        _class: _HeatPainter,
        new: function (canvas) {
            return new _HeatPainter(canvas);
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
