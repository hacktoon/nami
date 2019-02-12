
var MoisturePainter = (function () {
    var _MoisturePainter = function (canvas) {
        var self = this;
        this.ctx = canvas.getContext("2d");

        this.draw = function(moistureMap, tilesize){
            canvas.width = moistureMap.size * tilesize;
            canvas.height = moistureMap.size * tilesize;
            self.ctx.globalAlpha = .7;

            moistureMap.grid.forEach(function (value, point) {
                var x = point.x * tilesize,
                    y = point.y * tilesize,
                    code = Number(value);

                self.ctx.fillStyle = moistureMap.codeMap[code].color;
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
