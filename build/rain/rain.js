"use strict";

var RainMap = function () {
  var _RainMap = function _RainMap(size, roughness) {
    var self = this;
    this.size = size;
    this.heightMap = new HeightMap(size, roughness, _.noop);
    this.idMap = [{
      height: 0,
      color: "red",
      name: "Very dry"
    }, {
      height: 30,
      color: "coral",
      name: "Dry"
    }, {
      height: 90,
      color: "lightblue",
      name: "Wet"
    }, {
      height: 210,
      color: "blue",
      name: "Very wet"
    }];

    this.build = function (callback) {
      self.heightMap.grid.forEach(function (rawHeight, point) {
        self.idMap.forEach(function (rain, code) {
          if (rawHeight >= rain.height) {
            self.heightMap.grid.set(point, Number(code));
          }
        });
      });
    };
  };

  return {
    new: function _new(size, roughness) {
      var rain = new _RainMap(size, roughness);
      rain.build();
      return rain;
    }
  };
}();