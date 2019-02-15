
var TerrainPainter = (function () {
    var _TerrainPainter = function (canvas) {
        var self = this;
        this.ctx = canvas.getContext("2d");

        this.draw = function(world, tilesize){
            world.grid.forEach(function (tile, point) {
                var x = point.x * tilesize,
                    y = point.y * tilesize,
                    code = Number(tile.terrain.height);

                self.ctx.fillStyle = tile.terrain.color;
                self.ctx.fillRect(x, y, tilesize, tilesize);
            });
        };

        this.drawBlackWhite = function(world, tilesize){
            world.grid.forEach(function (tile, point) {
                var x = point.x * tilesize,
                    y = point.y * tilesize;

                self.ctx.fillStyle = tile.terrain.isWater ? "#FFF" : "#000";
                self.ctx.fillRect(x, y, tilesize, tilesize);
            });
        };

    };

    return {
        _class: _TerrainPainter,
        new: function (canvas) {
            return new _TerrainPainter(canvas);
        }
    };
})();
