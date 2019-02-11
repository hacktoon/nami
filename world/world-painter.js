
var WorldPainter = (function () {
    var _WorldPainter = function (canvas, tilesize) {
        var self = this;
        this.tilesize = tilesize;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d"),

        this.discreteColorMap = function (terrainCode) {
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

        this.draw = function(grid){
            var tilesize = self.tilesize;

            canvas.width = world.size * tilesize;
            canvas.height = world.size * tilesize;

            grid.forEach(function(currentValue, point){
                var x = point.x * tilesize,
                    y = point.y * tilesize;

                self.ctx.fillStyle = self.discreteColorMap(currentValue);
                self.ctx.fillRect(x, y, tilesize, tilesize);
            });
        };

    };

    return {
        _class: _WorldPainter,
        new: function (canvas, tilesize) {
            return new _WorldPainter(canvas, tilesize);
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
