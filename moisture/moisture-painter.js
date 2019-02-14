
var MoisturePainter = (function () {
    var _MoisturePainter = function (canvas) {
        var self = this;
        this.ctx = canvas.getContext("2d");

        this.draw = function(moistureMap, tilesize){
            self.ctx.globalAlpha = .3;

            moistureMap.grid.forEach(function (value, point) {
                var x = point.x * tilesize,
                    y = point.y * tilesize,
                    code = Number(value);

                self.ctx.fillStyle = moistureMap.idMap[code].color;
                self.ctx.fillRect(x, y, tilesize, tilesize);
            });
        };

    };

    return {
        _class: _MoisturePainter,
        new: function (canvas) {
            return new _MoisturePainter(canvas);
        }
    };
})();
