
var TectonicsPainter = (function () {
    var _TectonicsPainter = function (canvas) {
        var self = this;
        this.ctx = canvas.getContext("2d");
        this.tectonics = undefined;

        this.drawPoint = function (point, color, tilesize) {
            var point = self.tectonics.grid.wrap(point),
                ts = tilesize;
            self.ctx.fillStyle = color;
            self.ctx.fillRect(point.x * ts, point.y * ts, ts, ts);
        };

        this.drawEdges = function (tectonics, color, tilesize) {
            tectonics.plates.forEach(function(plate) {
                plate.forEachSeed(function (point) {
                    self.drawPoint(point, "red", tilesize);
                });
                plate.forEachEdge(function (point) {
                    self.drawPoint(point, color, tilesize);
                });
            });
        };

        this.draw = function(tectonics, tilesize) {
            self.tectonics = tectonics;
            self.drawEdges(tectonics, "black", tilesize);
            drawLabel(tilesize);
        };

        var drawLabel = function (tilesize){
            self.tectonics.plates.forEach(function (plate) {
                var symbol = Direction.getSymbol(plate.direction),
                    text = symbol + plate.speed +"S/"+plate.density+"D",
                    point = plate.region.startPoint,
                    x = tilesize * point.x,
                    y = tilesize * point.y;
                self.ctx.fillStyle = "black";
                self.ctx.fillRect(x, y, tilesize, tilesize);
                self.ctx.font = "15px Arial";
                self.ctx.strokeStyle = "black";
                self.ctx.lineWidth = 4;
                self.ctx.strokeText(text, x, y);
                self.ctx.fillStyle = "white";
                self.ctx.fillText(text, x, y);
            });
        };
    };

    return {
        _class: _TectonicsPainter,
        new: function (canvas) {
            return new _TectonicsPainter(canvas);
        }
    };
})();
