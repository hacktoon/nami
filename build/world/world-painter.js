"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var WorldPainter =
/*#__PURE__*/
function () {
  function WorldPainter(canvas) {
    _classCallCheck(this, WorldPainter);

    this.ctx = canvas.getContext("2d");
  }

  _createClass(WorldPainter, [{
    key: "draw",
    value: function draw(world, tilesize) {
      var _this = this;

      world.grid.forEach(function (tile, point) {
        var x = point.x * tilesize,
            y = point.y * tilesize;
        _this.ctx.fillStyle = tile.terrain.color;

        _this.ctx.fillRect(x, y, tilesize, tilesize);
      });
    }
  }, {
    key: "drawBlackWhite",
    value: function drawBlackWhite(world, tilesize) {
      var _this2 = this;

      world.grid.forEach(function (tile, point) {
        var x = point.x * tilesize,
            y = point.y * tilesize;
        _this2.ctx.fillStyle = tile.terrain.isWater ? "#FFF" : "#000";

        _this2.ctx.fillRect(x, y, tilesize, tilesize);
      });
    }
  }, {
    key: "drawTectonics",
    value: function drawTectonics(world, tilesize) {
      var _this3 = this;

      world.grid.forEach(function (tile, point) {
        var x = point.x * tilesize,
            y = point.y * tilesize;

        if (tile.isPlateEdge) {
          _this3.ctx.fillStyle = "red";
        } else {
          _this3.ctx.fillStyle = tile.terrain.color;
        }

        _this3.ctx.fillRect(x, y, tilesize, tilesize);
      });
    }
  }, {
    key: "drawBorders",
    value: function drawBorders(world, tilesize) {
      var _this4 = this;

      var previousIsWater = false;
      world.grid.forEach(function (tile, point) {
        var x = point.x * tilesize,
            y = point.y * tilesize;
        var color = "#FFF";

        if (!tile.terrain.isWater && previousIsWater) {
          color = "#000";
        }

        previousIsWater = tile.terrain.isWater;
        _this4.ctx.fillStyle = color;

        _this4.ctx.fillRect(x, y, tilesize, tilesize);
      });
    }
  }]);

  return WorldPainter;
}();

var isBeach = function isBeach(point) {
  var neighbors = new PointNeighborhood(point),
      found = false;
  neighbors.adjacent(function (neighbor) {
    var isLand = grid.get(point) > world.seaLevel; //var hasWaterNeighbor = grid.get(neighbor) <= world.seaLevel;

    var diff = grid.get(point) - grid.get(neighbor);

    if (isLand && hasWaterNeighbor && diff < 8) {
      found = true;
      return;
    }
  });
  return found;
};