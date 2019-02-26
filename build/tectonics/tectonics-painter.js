"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var TectonicsPainter =
/*#__PURE__*/
function () {
  function TectonicsPainter(canvas) {
    _classCallCheck(this, TectonicsPainter);

    this.ctx = canvas.getContext("2d");
    this.tectonics = undefined;
  }

  _createClass(TectonicsPainter, [{
    key: "drawPoint",
    value: function drawPoint(point, color, tilesize) {
      var ts = tilesize;
      point = this.tectonics.grid.wrap(point);
      this.ctx.fillStyle = color;
      this.ctx.fillRect(point.x * ts, point.y * ts, ts, ts);
    }
  }, {
    key: "drawEdges",
    value: function drawEdges(tectonics, color, tilesize) {
      var _this = this;

      tectonics.plates.forEach(function (plate) {
        plate.forEachSeed(function (point) {
          _this.drawPoint(point, "red", tilesize);
        });
        plate.forEachEdge(function (point) {
          _this.drawPoint(point, color, tilesize);
        });
      });
    }
  }, {
    key: "draw",
    value: function draw(tectonics, tilesize) {
      this.tectonics = tectonics;
      this.drawEdges(tectonics, "black", tilesize);
      this.drawLabel(tilesize);
    }
  }, {
    key: "drawLabel",
    value: function drawLabel(tilesize) {
      var _this2 = this;

      this.tectonics.plates.forEach(function (plate) {
        var symbol = Direction.getSymbol(plate.direction),
            text = symbol + plate.speed + "S/" + plate.density + "D",
            point = plate.region.startPoint,
            x = tilesize * point.x,
            y = tilesize * point.y;
        _this2.ctx.fillStyle = "black";

        _this2.ctx.fillRect(x, y, tilesize, tilesize);

        _this2.ctx.font = "15px Arial";
        _this2.ctx.strokeStyle = "black";
        _this2.ctx.lineWidth = 4;

        _this2.ctx.strokeText(text, x, y);

        _this2.ctx.fillStyle = "white";

        _this2.ctx.fillText(text, x, y);
      });
    }
  }]);

  return TectonicsPainter;
}();