
var TerrainPainter = (function () {
    var _TerrainPainter = function (canvas) {
        var self = this;
        this.ctx = canvas.getContext("2d");

        this.draw = function(terrainMap, tilesize){
            canvas.width = terrainMap.grid.width * tilesize;
            canvas.height = terrainMap.grid.height * tilesize;

            terrainMap.grid.forEach(function (value, point) {
                var x = point.x * tilesize,
                    y = point.y * tilesize,
                    code = Number(value);

                self.ctx.fillStyle = terrainMap.codeMap[code].color;
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
