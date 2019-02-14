

var TectonicsMap = (function() {
    var _TectonicsMap = function(size, totalPlates) {
        var self = this,
            growthRate = 15;

        this.grid = Grid.new(size, size);
        this.plates = [];
        this.plateIdMap = {};

        this.initPlates = function() {
            var createPlate = function(point, plateId) {
                var plate = Plate.new(plateId);
                plate.region = GridFill.new(self.grid, plateId);
                self.plateIdMap[plateId] = plate;
                plate.region.startAt(point);
                self.plates.push(plate);
            };
            GridPointDistribution(self.grid, totalPlates, createPlate);
        };

        this.getPlateById = function (id) {
            return self.plateIdMap[id];
        };

        /* Grow the plates until all them complete. */
        this.buildPlates = function (growOptions) {
            var defaultOpts = { partial: true, times: growthRate, chance: false },
                growOptions = _.assign(defaultOpts, growOptions),
                totalCompleted = 0,
                completedMap = {};

            while (totalCompleted < self.plates.length) {
                _.each(self.plates, function(plate) {
                    if (plate.region.isComplete()) {
                        totalCompleted += completedMap[plate.id] ? 0 : 1;
                        completedMap[plate.id] = 1;
                        return;
                    }
                    plate.region.grow(growOptions);
                });
            }
        };

        this.hasPointInEdges = function (point) {
            var key = point.hash();
            return _.has(self.edgeDeformationMap, key);
        };

        this.getDeformation = function (point) {
            return self.edgeDeformationMap[point.hash()];
        };

        this.forEachPlate = function(callback) {
            self.plates.forEach(function(plate) {
                callback(plate);
            });
        };
    };

    return {
        _class: _TectonicsMap,

        new: function(size, totalPlates) {
            var tectonics = new _TectonicsMap(size, totalPlates);
            tectonics.initPlates();
            return tectonics;
        }
    };
})();


var Plate = (function() {
    var _Plate = function(id) {
        var self = this;
        this.id = id;
        this.region = undefined;
        this.speed = _.sample([1, 2, 3]);
        this.density = _.sample([1, 1, 2, 2, 3]);
        this.direction = Direction.randomCardinal();

        this.forEachEdge = function(callback) {
            self.region.edges(function(point) {
                callback(point);
            });
        };

        this.forEachEdgeInDirection = function(direction, callback) {
            self.region.edgesByDirection(direction, function(point) {
                callback(point);
            });
        };
    };

    return {
        _class: _Plate,
        new: function(id) {
            return new _Plate(id);
        }
    };
})();


var PlateDeformation = (function() {
    var _PlateDeformation = function (plate) {
        var self = this,
            directionPenalty = 300;
        this.plate = plate;

        this.between = function (plate) {
            var direction = self.plate.direction;
            if (Direction.isDivergent(direction, plate.direction)) {
                return -directionPenalty;
            } else if (Direction.isConvergent(direction, plate.direction)) {
                return directionPenalty;
            }
            return 0;
        };
    };

    return {
        _class: _PlateDeformation,
        new: function(target_plate) {
            return new _PlateDeformation(target_plate);
        }
    };
})();
