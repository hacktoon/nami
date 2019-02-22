"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var HeightMap =
/*#__PURE__*/
function () {
  function HeightMap(size, roughness, callback) {
    _classCallCheck(this, HeightMap);

    this.size = size;
    this.grid = new Grid(size, size, 0);
    this.callback = _.noop;
    this.callback = callback;
    this.setInitialPoints();

    for (var midSize = size - 1; midSize / 2 >= 1; midSize /= 2) {
      var half = midSize / 2,
          scale = roughness * midSize;

      for (var y = half; y < size - 1; y += midSize) {
        for (var x = half; x < size - 1; x += midSize) {
          var variance = _.random(-scale, scale),
              point = new Point(x, y);

          this.square(point, half, variance);
        }
      }

      for (var _y = 0; _y <= size - 1; _y += half) {
        for (var _x = (_y + half) % midSize; _x <= size - 1; _x += midSize) {
          var _variance = _.random(-scale, scale),
              _point = new Point(_x, _y);

          this.diamond(_point, half, _variance);
        }
      }
    }

    delete this.grid;
  }

  _createClass(HeightMap, [{
    key: "setInitialPoints",
    value: function setInitialPoints() {
      var _this = this;

      var maxIndex = this.size - 1;

      var rand = function rand() {
        return _.random(0, _this.size);
      };

      this.setPoint(new Point(0, 0), rand());
      this.setPoint(new Point(maxIndex, 0), rand());
      this.setPoint(new Point(0, maxIndex), rand());
      this.setPoint(new Point(maxIndex, maxIndex), rand());
    }
  }, {
    key: "diamond",
    value: function diamond(point, midSize, offset) {
      var x = point.x,
          y = point.y,
          average = this.averagePoints([new Point(x, y - midSize), // top
      new Point(x + midSize, y), // right
      new Point(x, y + midSize), // bottom
      new Point(x - midSize, y) // left
      ]);
      this.setPoint(point, average + offset);
    }
  }, {
    key: "square",
    value: function square(point, midSize, offset) {
      var x = point.x,
          y = point.y,
          average = this.averagePoints([new Point(x - midSize, y - midSize), // upper left
      new Point(x + midSize, y - midSize), // upper right
      new Point(x + midSize, y + midSize), // lower right
      new Point(x - midSize, y + midSize) // lower left
      ]);
      this.setPoint(point, average + offset);
    }
  }, {
    key: "setPoint",
    value: function setPoint(point, height) {
      height = _.clamp(height, 0, this.size);

      if (this.grid.isEdge(point)) {
        var oppositeEdge = this.grid.oppositeEdge(point);
        this.grid.set(oppositeEdge, height);
      }

      this.grid.set(point, height);
      this.callback(point, height);
    }
  }, {
    key: "averagePoints",
    value: function averagePoints(points) {
      var _this2 = this;

      var values = points.map(function (pt) {
        return _this2.grid.get(pt);
      });
      values.sort(function (a, b) {
        return a - b;
      });

      if (values.length % 2 == 0) {
        var midIndex = values.length / 2;
        var first = values[midIndex - 1];
        var second = values[midIndex];
        return Math.round((first + second) / 2);
      } else {
        var index = Math.floor(values.length / 2);
        return values[index];
      }
    }
  }]);

  return HeightMap;
}();

var MidpointDisplacement = function MidpointDisplacement(p1, p2, maxSize, roughness, callback) {
  var points = Array(size),
      size = maxSize - 1,
      displacement = roughness * (size / 2);

  var buildPoint = function buildPoint(p1, p2) {
    if (p2.x - p1.x <= 1) return;

    var x = Math.floor((p1.x + p2.x) / 2),
        y = (p1.y + p2.y) / 2 + _.random(-displacement, displacement);

    y = _.clamp(Math.round(y), 0, maxSize - 1);
    return new Point(x, y);
  };

  var midpoint = function midpoint(p1, p2, size) {
    var point = buildPoint(p1, p2);
    if (!point) return;
    points[point.x] = point;
    callback(point);
    displacement = roughness * size;
    midpoint(p1, point, size / 2);
    midpoint(point, p2, size / 2);
  };

  points[p1.x] = p1;
  callback(p1);
  points[p2.x] = p2;
  callback(p2);
  midpoint(p1, p2, size / 2);
  return points;
};