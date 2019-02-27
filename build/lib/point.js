"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Point =
/*#__PURE__*/
function () {
  function Point(x, y) {
    _classCallCheck(this, Point);

    this.x = x;
    this.y = y;
  }

  _createClass(Point, [{
    key: "hash",
    value: function hash() {
      return "".concat(this.x, ",").concat(this.y);
    }
  }], [{
    key: "from",
    value: function from(string) {
      var bits = string.replace(' ', '').split(','),
          x = _.parseInt(bits[0]),
          y = _.parseInt(bits[1]);

      return new Point(x, y);
    }
  }, {
    key: "euclidianDistance",
    value: function euclidianDistance(point1, point2) {
      var deltaX = Math.pow(point2.x - point1.x, 2),
          deltaY = Math.pow(point2.y - point1.y, 2);
      return Math.sqrt(deltaX + deltaY);
    }
  }, {
    key: "manhattanDistance",
    value: function manhattanDistance(point1, point2) {
      var deltaX = Math.abs(point2.x - point1.x),
          deltaY = Math.abs(point2.y - point1.y);
      return deltaX + deltaY;
    }
  }]);

  return Point;
}();

var PointNeighborhood =
/*#__PURE__*/
function () {
  function PointNeighborhood(referencePoint) {
    _classCallCheck(this, PointNeighborhood);

    this.referencePoint = referencePoint;
    var adjacent = {},
        diagonal = {};
    adjacent[Direction.NORTH] = {
      x: 0,
      y: -1
    };
    adjacent[Direction.SOUTH] = {
      x: 0,
      y: 1
    };
    adjacent[Direction.EAST] = {
      x: 1,
      y: 0
    };
    adjacent[Direction.WEST] = {
      x: -1,
      y: 0
    };
    diagonal[Direction.NORTHEAST] = {
      x: 1,
      y: 1
    };
    diagonal[Direction.NORTHWEST] = {
      x: -1,
      y: 1
    };
    diagonal[Direction.SOUTHEAST] = {
      x: 1,
      y: -1
    };
    diagonal[Direction.SOUTHWEST] = {
      x: -1,
      y: -1
    };
    this.directions = {
      adjacent: adjacent,
      diagonal: diagonal,
      around: _.extend({}, adjacent, diagonal)
    };
  }

  _createClass(PointNeighborhood, [{
    key: "adjacent",
    value: function adjacent(callback) {
      return this.getNeighbors(this.directions.adjacent, callback);
    }
  }, {
    key: "diagonal",
    value: function diagonal(callback) {
      return this.getNeighbors(this.directions.diagonal, callback);
    }
  }, {
    key: "around",
    value: function around(callback) {
      return this.getNeighbors(this.directions.around, callback);
    }
  }, {
    key: "atDirection",
    value: function atDirection(direction) {
      var around = this.directions.around;
      return this.createPoint(around[direction]);
    }
  }, {
    key: "getNeighbors",
    value: function getNeighbors(neighborType, callback) {
      var _this = this;

      var neighbors = [];

      _.each(neighborType, function (neighbor, direction) {
        var point = _this.createPoint(neighbor);

        neighbors.push({
          point: point,
          direction: direction
        });

        if (_.isFunction(callback)) {
          callback(point, direction);
        }
      });

      return neighbors;
    }
  }, {
    key: "createPoint",
    value: function createPoint(neighbor) {
      var x = this.referencePoint.x + neighbor.x,
          y = this.referencePoint.y + neighbor.y;
      return new Point(x, y);
    }
  }]);

  return PointNeighborhood;
}();