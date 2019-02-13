
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

        this.drawEdges = function (color, tilesize) {
            _.each(self.tectonics.plates, function (plate) {
                plate.forEachEdge(function (point) {
                    self.drawPoint(point, color || "#000", tilesize);
                });
            });
        };

        this.drawEdgesByDirection = function (direction, color, tilesize) {
            _.each(self.tectonics.plates, function (plate) {
                plate.forEachEdgeInDirection(direction, function (point) {
                    self.drawPoint(point, color, tilesize);
                });
            });
        };

        this.draw = function(tectonics, tilesize) {
            self.tectonics = tectonics;
            tectonics.grid.forEach(function (code, point) {
                var color = tectonics.idMap[code].color;
                self.drawPoint(point, color, tilesize);
            });
            self.drawEdges("#222", tilesize);
            drawLabel(tilesize);
        };

        var drawLabel = function (tilesize){
            _.each(self.tectonics.plates, function (plate) {
                var symbol = Direction.getSymbol(plate.direction),
                    text = symbol + plate.speed +"S\n"+plate.density+"D",
                    point = plate.region.startPoint,
                    x = tilesize * point.x,
                    y = tilesize * point.y;
                self.ctx.fillStyle = "white";
                self.ctx.font = "20px Arial";
                self.ctx.strokeStyle = "black";
                self.ctx.fillText(text, x, y);
                self.ctx.strokeText(text, x, y);
            });
        };
    };

    return {
        _class: _TectonicsPainter,
        new: function (tectonics, canvas, tilesize) {
            return new _TectonicsPainter(tectonics, canvas, tilesize);
        }
    };
})();
