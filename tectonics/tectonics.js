

var Tectonics = (function() {
    var _Tectonics = function(size) {
        var self = this;

        this.grid = Grid.new(size, size);
        this.plates = [];
        this.plateIdMap = {};
        this.edgeDeformationMap = {};

        this.initPlates = function(totalPlates) {
            var points = self.grid.randomPoints(totalPlates);
            _.each(points, function(point, plateId) {
                var plate = Plate.new(plateId);

                plate.region = GridFill.new(self.grid, plateId);
                self.plateIdMap[plateId] = plate;
                plate.region.startAt(point);
                self.plates.push(plate);
            });
        };

        /* Grow the plates until all them complete. */
        this.buildPlates = function (growOptions) {
            var totalCompleted = 0,
                completedMap = {},
                growOptions = growOptions || {partial: true, times: 5, chance: false};

            while (totalCompleted < self.plates.length) {
                _.each(self.plates, function(plate) {
                    if (plate.region.isComplete()) {
                        var plateCompleted = Boolean(completedMap[plate.id]);
                        totalCompleted += plateCompleted ? 0 : 1;
                        completedMap[plate.id] = 1;
                        return;
                    }
                    plate.region.grow(growOptions);
                });
            }
            applyDeformations();
        };

        var applyDeformations = function() {
            self.forEachPlate(function(plate) {
                var deformation = PlateDeformation.new(plate);
                plate.region.edges(function(edge){
                    var neighbors = PointNeighborhood.new(edge),
                        deformationValue = 0;
                    neighbors.around(function(neighbor){
                        var neighborValue = self.grid.get(neighbor);
                        if (neighborValue == plate.id)
                            return;
                        var otherPlate = self.plateIdMap[neighborValue];
                        deformationValue += deformation.between(otherPlate);
                    });
                    self.edgeDeformationMap[edge.hash()] = deformationValue;
                });
            });
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
        _class: _Tectonics,

        new: function(size, totalPlates) {
            var tectonics = new _Tectonics(size);
            tectonics.initPlates(totalPlates);
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
        this.density = _.sample([1, 2]);
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
    var _PlateDeformation = function (target_plate) {
        var self = this,
            densityPenalty = 10,
            speedPenalty = 10,
            directionPenalty = 10;
        this.plate = target_plate;

        this.between = function (plate) {
            var value = 0;
            self.plate.direction == plate.direction

            // check dir
            if (self.plate.speed > plate.speed) {
                value -= speedPenalty;
            } else {
                value += speedPenalty;
            }

            if (self.plate.density > plate.density){
                value -= densityPenalty;
            } else {
                value += densityPenalty;
            }

            return value;
        };
    };

    return {
        _class: _PlateDeformation,
        new: function(target_plate) {
            return new _PlateDeformation(target_plate);
        }
    };
})();
