

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
                plate.region.edges(function(edge){
                    var neighbors = PointNeighborhood.new(edge);
                    neighbors.around(function(neighbor, direction){
                        var neighborValue = self.grid.get(neighbor);
                        if (neighborValue == plate.id) return;
                        var other = self.plateIdMap[neighborValue];
                        //var deformation = PlateDeformation(plate, other);
                        self.edgeDeformationMap[edge.hash()] = -40 //deformation;
                    });
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
        this.weight = _.sample([1, 2]);
        this.direction = Direction.random();

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
    var _PlateDeformation = function() {
        var self = this;

    };

    return {
        _class: _PlateDeformation,
        new: function(plate1, plate2) {
            return new _PlateDeformation(plate1, plate2);
        }
    };
})();
