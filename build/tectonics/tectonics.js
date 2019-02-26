"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var TectonicsBuilder =
/*#__PURE__*/
function () {
  function TectonicsBuilder() {
    _classCallCheck(this, TectonicsBuilder);
  }

  _createClass(TectonicsBuilder, null, [{
    key: "build",
    value: function build(world, numPlates) {
      var tectonics = new Tectonics(world.size, numPlates),
          growthRate = 15,
          chanceToGrow = true,
          partialGrow = true;
      tectonics.initPlates();
      tectonics.onPlatePoint(function (point, plate, step) {
        var tile = world.getTile(point);
        tile.plate = plate;

        if (plate.isDenser()) {
          var h = world.getTile(point).height;
          world.lowerTerrain(point, h / 2);
        }
      });
      tectonics.onPlateEdgeDetect(function (point, plate, step) {
        var tile = world.getTile(point);
        tile.isPlateEdge = true;
        world.raiseTerrain(point, _.random(10, 50));
      });
      tectonics.build(growthRate, chanceToGrow, partialGrow);
    }
  }]);

  return TectonicsBuilder;
}();

var Tectonics =
/*#__PURE__*/
function () {
  function Tectonics(size, numPlates) {
    _classCallCheck(this, Tectonics);

    this.numPlates = numPlates;
    this.grid = new Grid(size, size);
    this.plates = [];
    this.plateIdMap = {};
    this.onFillCallback = _.noop;
    this.onPlateEdgeCallback = _.noop;
  }

  _createClass(Tectonics, [{
    key: "onPlatePoint",
    value: function onPlatePoint(callback) {
      var _this = this;

      this.onFillCallback = function (point, fillValue, step) {
        var plate = _this.plateIdMap[fillValue];
        callback(point, plate, step);
      };
    }
  }, {
    key: "onPlateEdgeDetect",
    value: function onPlateEdgeDetect(callback) {
      var _this2 = this;

      this.onPlateEdgeCallback = function (edge, outerEdge, step) {
        var plate = _this2.getPlateByPoint(edge);

        var otherPlate = _this2.getPlateByPoint(outerEdge);

        callback(edge, outerEdge, step);
      };
    }
  }, {
    key: "getPlateById",
    value: function getPlateById(id) {
      return this.plateIdMap[id];
    }
  }, {
    key: "getPlateByPoint",
    value: function getPlateByPoint(point) {
      var id = this.grid.get(point);
      return this.getPlateById(id);
    }
    /* Grow the plates until all them complete. */

  }, {
    key: "build",
    value: function build(times, chance, isPartial) {
      var totalCompleted = 0,
          completedMap = {};
      chance = _.defaultTo(chance, false);

      while (totalCompleted < this.plates.length) {
        this.plates.forEach(function (plate) {
          if (plate.region.isComplete()) {
            totalCompleted += completedMap[plate.id] ? 0 : 1;
            completedMap[plate.id] = 1;
            return;
          }

          if (chance && _.sample([true, false])) return;

          if (isPartial) {
            plate.region.growPartial(times);
          } else {
            plate.region.grow(times);
          }
        });
      }
    }
  }, {
    key: "initPlates",
    value: function initPlates() {
      var _this3 = this;

      var eachPoint = function eachPoint(startPoint, plateId) {
        var plate = new Plate(plateId),
            originalValue = _this3.grid.get(startPoint);

        var onFill = function onFill(neighbor, point, step) {
          _this3.grid.set(neighbor, plateId);

          _this3.onFillCallback(neighbor, plateId, step);
        };

        var isFillable = function isFillable(neighbor, point, step) {
          var neighborValue = _this3.grid.get(neighbor);

          if (neighborValue != plateId && neighborValue != originalValue) {
            plate.edges.push(point);

            _this3.onPlateEdgeCallback(point, neighbor, step);

            return false;
          }

          return neighborValue === originalValue;
        };

        plate.region = new GridFill(startPoint, onFill, isFillable);
        _this3.plateIdMap[plateId] = plate;

        _this3.plates.push(plate);
      };

      new GridPointDistribution(this.grid, this.numPlates).each(eachPoint);
    }
  }]);

  return Tectonics;
}();

var Plate =
/*#__PURE__*/
function () {
  function Plate(id) {
    _classCallCheck(this, Plate);

    this.id = id;
    this.name = NameGenerator.createLandMassName();
    this.region = undefined;
    this.speed = _.sample([1, 2, 3]);
    this.density = _.sample([1, 1, 2, 2, 3]);
    this.direction = Direction.randomCardinal();
    this.edges = [];
  }

  _createClass(Plate, [{
    key: "isDenser",
    value: function isDenser() {
      return this.density === 3;
    }
  }, {
    key: "forEachEdge",
    value: function forEachEdge(callback) {
      this.edges.forEach(callback);
    }
  }, {
    key: "forEachSeed",
    value: function forEachSeed(callback) {
      this.region.seeds.each(callback);
    }
  }]);

  return Plate;
}();

var PlateDeformation =
/*#__PURE__*/
function () {
  function PlateDeformation(plate) {
    _classCallCheck(this, PlateDeformation);

    this.directionPenalty = 300;
    this.plate = plate;
  }

  _createClass(PlateDeformation, [{
    key: "between",
    value: function between(plate) {
      var direction = this.plate.direction;

      if (Direction.isDivergent(direction, plate.direction)) {
        return -directionPenalty;
      } else if (Direction.isConvergent(direction, plate.direction)) {
        return directionPenalty;
      }

      return 0;
    }
  }]);

  return PlateDeformation;
}();