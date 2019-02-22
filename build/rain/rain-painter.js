"use strict";

var RainPainter = function () {
  var _RainPainter = function _RainPainter(canvas) {
    var self = this;
    this.ctx = canvas.getContext("2d");

    this.draw = function (rainMap, tilesize) {
      self.ctx.globalAlpha = .3;
      rainMap.heightMap.grid.forEach(function (value, point) {
        var x = point.x * tilesize,
            y = point.y * tilesize,
            code = Number(value);
        self.ctx.fillStyle = rainMap.idMap[code].color;
        self.ctx.fillRect(x, y, tilesize, tilesize);
      });
    };
  };

  return {
    _class: _RainPainter,
    new: function _new(canvas) {
      return new _RainPainter(canvas);
    }
  };
}();