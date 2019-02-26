"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Grid =
/*#__PURE__*/
function () {
  function Grid(width, height, defaultValue) {
    _classCallCheck(this, Grid);

    this.width = width;
    this.height = height;
    this.matrix = [];

    for (var y = 0; y < this.height; y++) {
      this.matrix.push([]);

      for (var x = 0; x < this.width; x++) {
        this.matrix[y].push(defaultValue);
      }
    }
  }

  _createClass(Grid, [{
    key: "get",
    value: function get(point) {
      var p = this.wrap(point);
      return this.matrix[p.y][p.x];
    }
  }, {
    key: "set",
    value: function set(point, value) {
      var p = this.wrap(point);
      this.matrix[p.y][p.x] = value;
    }
  }, {
    key: "wrap",
    value: function wrap(point) {
      var x = point.x,
          y = point.y;

      if (x >= this.width) {
        x %= this.width;
      }

      if (y >= this.height) {
        y %= this.height;
      }

      if (x < 0) {
        x = this.width - 1 - Math.abs(x + 1) % this.width;
      }

      if (y < 0) {
        y = this.height - 1 - Math.abs(y + 1) % this.height;
      }

      return new Point(x, y);
    }
  }, {
    key: "forEach",
    value: function forEach(callback) {
      for (var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
          var point = new Point(x, y),
              value = this.get(point);
          callback(value, point);
        }
      }
    }
  }, {
    key: "isEdge",
    value: function isEdge(point) {
      var isTopLeft = point.x === 0 || point.y === 0,
          isBottomRight = point.x === this.width - 1 || point.y === this.height - 1;
      return isTopLeft || isBottomRight;
    }
  }, {
    key: "oppositeEdge",
    value: function oppositeEdge(point) {
      var x = point.x,
          y = point.y;

      if (!this.isEdge(point)) {
        throw new RangeError("Point not in edge");
      }

      if (point.x === 0) {
        x = this.width - 1;
      }

      if (point.x === this.width - 1) {
        x = 0;
      }

      if (point.y === 0) {
        y = this.height - 1;
      }

      if (point.y === this.height - 1) {
        y = 0;
      }

      return new Point(x, y);
    }
  }]);

  return Grid;
}();

var GridPointDistribution =
/*#__PURE__*/
function () {
  function GridPointDistribution(grid) {
    var numPoints = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    _classCallCheck(this, GridPointDistribution);

    this.grid = grid;
    this.numPoints = numPoints;
    this.chosenPoints = new PointMap();
  }

  _createClass(GridPointDistribution, [{
    key: "createRandomPoint",
    value: function createRandomPoint() {
      var x = _.random(this.grid.width - 1),
          y = _.random(this.grid.height - 1);

      return new Point(x, y);
    }
  }, {
    key: "each",
    value: function each(callback) {
      var count = 0;

      while (count < this.numPoints) {
        var point = this.createRandomPoint();
        if (this.chosenPoints.has(point)) continue;
        this.chosenPoints.add(point);
        callback(point, count++);
      }
    }
  }]);

  return GridPointDistribution;
}();

var GridFill =
/*#__PURE__*/
function () {
  function GridFill(point, onFill, isFillable) {
    _classCallCheck(this, GridFill);

    this.onFill = _.defaultTo(onFill, _.noop);
    this.isFillable = _.defaultTo(isFillable, _.stubTrue);
    this.step = 0;
    this.seeds = new PointMap(point);
    this.startPoint = point;
  }

  _createClass(GridFill, [{
    key: "isComplete",
    value: function isComplete(times) {
      var noSeeds = this.seeds.size() === 0,
          timesEnded = _.isNumber(times) && times <= 0;
      return noSeeds || timesEnded;
    }
  }, {
    key: "fill",
    value: function fill() {
      while (!this.isComplete()) {
        this.grow();
      }
    }
  }, {
    key: "grow",
    value: function grow(times) {
      this._grow(times, false);
    }
  }, {
    key: "growPartial",
    value: function growPartial(times) {
      this._grow(times, true);
    }
  }, {
    key: "_grow",
    value: function _grow(times, isPartial) {
      var _this = this;

      times = _.defaultTo(times, 1);
      if (this.isComplete(times)) return;
      var currentSeeds = this.seeds;
      this.seeds = new PointMap();
      currentSeeds.each(function (point) {
        _this.growNeighbors(point, isPartial);
      });

      if (times > 1) {
        this._grow(times - 1, isPartial);
      }

      this.step++;
    }
  }, {
    key: "growNeighbors",
    value: function growNeighbors(referencePoint, isPartial) {
      var _this2 = this;

      new PointNeighborhood(referencePoint).adjacent(function (neighbor) {
        if (!_this2.isFillable(neighbor, referencePoint, _this2.step)) return;

        if (isPartial && _.sample([true, false])) {
          _this2.seeds.add(referencePoint);
        } else {
          _this2.seeds.add(neighbor);

          _this2.onFill(neighbor, referencePoint, _this2.step);
        }
      });
    }
  }]);

  return GridFill;
}();