
var TemperaturePainter = (function () {
    var _TemperaturePainter = function (canvas) {
        var self = this;
        this.ctx = canvas.getContext("2d"),

        this.draw = function(temperatureMap, tilesize){
            canvas.width = temperatureMap.size * tilesize;
            canvas.height = temperatureMap.size * tilesize;

            _.each(temperatureMap.points, function(point){
                var x = point.x * tilesize,
                    y = point.y * tilesize;

                self.ctx.fillStyle = "rgba(255, 255, 255, 1)";
                self.ctx.fillRect(x, y, tilesize, tilesize);
            });
        };

    };

    return {
        _class: _TemperaturePainter,
        new: function (canvas) {
            return new _TemperaturePainter(canvas);
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
