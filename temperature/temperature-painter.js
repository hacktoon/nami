
var TemperaturePainter = (function () {
    var _TemperaturePainter = function (canvas, tilesize) {
        var self = this;
        this.tilesize = tilesize;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d"),

        this.draw = function(grid){
            var tilesize = self.tilesize;

            canvas.width = grid.width * tilesize;
            canvas.height = grid.height * tilesize;

            grid.forEach(function(currentValue, point){
                var x = point.x * tilesize,
                    y = point.y * tilesize;

                self.ctx.fillStyle = "rgba(255, 255, 255, .5)";
                self.ctx.fillRect(x, y, tilesize, tilesize);
            });
        };

    };

    return {
        _class: _TemperaturePainter,
        new: function (canvas, tilesize) {
            return new _TemperaturePainter(canvas, tilesize);
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
