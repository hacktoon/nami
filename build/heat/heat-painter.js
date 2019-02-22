"use strict";

var HeatPainter = function () {
  var _HeatPainter = function _HeatPainter(canvas) {
    var self = this;
    this.ctx = canvas.getContext("2d");

    this.draw = function (heatMap, tilesize) {
      self.ctx.globalAlpha = .3;
      heatMap.grid.forEach(function (value, point) {
        var x = point.x * tilesize,
            y = point.y * tilesize;
        self.ctx.fillStyle = heatMap.idMap[Number(value)].color;
        self.ctx.fillRect(x, y, tilesize, tilesize);
      });
    };
  };

  return {
    _class: _HeatPainter,
    new: function _new(canvas) {
      return new _HeatPainter(canvas);
    }
  };
}();