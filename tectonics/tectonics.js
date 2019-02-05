

var Tectonics = (function() {
    var _Tectonics = function(size) {
        var self = this;

        this.grid = Grid.new(size, size);
        this.plates = [];
        this.edgesMap = {};
        this.plateIdMap = {};
        //TODO this.subductions = {};
        //TODO this.mountainRanges = {};

        this.buildPlates = function (growOptions) {
            var totalCompleted = 0,
                completedMap = {},
                growOptions = growOptions || {partial: true, times: 4, chance: false};

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
            registerFeatures();
        };

        var registerFeatures = function() {
            _.each(self.plates, function(plate) {
                var direction = plate.direction;
                plate.region.edges(function(point){

                });
            });
        };

        this.forEachPlate = function(callback) {
            tectonics.plates.forEach(function(plate) {
                callback(plate);
            });
        };

        this.initPlates = function(totalPlates) {
            var points = self.grid.randomPoints(totalPlates);
            _.each(points, function(point, index) {
                var plate = Plate.new(index);

                plate.region = GridFill.new(self.grid, index);
                self.plateIdMap[index] = plate;
                plate.region.startAt(point);
                self.plates.push(plate);
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
        this.speed = _.sample([1, 2]);
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
