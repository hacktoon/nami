

var WorldPainter = (function () {
    var _WorldPainter = function (canvas) {
        var self = this;
        this.ctx = canvas.getContext("2d");

        this.draw = function (world, tilesize) {
            world.grid.forEach(function (tile, point) {
                var x = point.x * tilesize,
                    y = point.y * tilesize;

                self.ctx.fillStyle = tile.terrain.color;
                self.ctx.fillRect(x, y, tilesize, tilesize);
            });
        };

        this.drawBlackWhite = function (world, tilesize) {
            world.grid.forEach(function (tile, point) {
                var x = point.x * tilesize,
                    y = point.y * tilesize;

                self.ctx.fillStyle = tile.terrain.isWater ? "#FFF" : "#000";
                self.ctx.fillRect(x, y, tilesize, tilesize);
            });
        };

        this.drawTectonics = function (world, tilesize) {
            world.grid.forEach(function (tile, point) {
                var x = point.x * tilesize,
                    y = point.y * tilesize;

                if (tile.isPlateEdge) {
                    self.ctx.fillStyle = "red";
                } else {
                    self.ctx.fillStyle = tile.terrain.color;
                }
                self.ctx.fillRect(x, y, tilesize, tilesize);
            });
        };

        this.drawBorders = function (world, tilesize) {
            var previousIsWater = false;
            world.grid.forEach(function (tile, point) {
                var x = point.x * tilesize,
                y = point.y * tilesize;

                var color = "#FFF";
                if (!tile.terrain.isWater && previousIsWater) {
                    color = "#000";
                }
                previousIsWater = tile.terrain.isWater;
                self.ctx.fillStyle = color;
                self.ctx.fillRect(x, y, tilesize, tilesize);
            });
        };

    };

    return {
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
