

var Tectonics = (function() {
    var _Tectonics = function(size) {
        var self = this;

        this.grid = Grid.new(size, size);
        this.plates = [];
        //TODO  this.subductions = {};

        //TODO this.mountainRanges = {};
        this.buildPlates = function() {
            var totalCompleted = 0,
                completedMap = {};

            while (totalCompleted != self.plates.length) {
                _.each(self.plates, function(plate) {
                    if (plate.region.isComplete()) {
                        var plateCompleted = Boolean(completedMap[plate.id]);
                        // TODO  TruthMap
                        totalCompleted += plateCompleted ? 0 : 1;
                        completedMap[plate.id] = 1;
                        return;
                    }
                    plate.region.grow({partial: true, times: 4, chance: true});
                });
            }
        };

        this.initPlates = function(totalPlates) {
            var points = self.grid.randomPoints(totalPlates);
            _.each(points, function(point, index) {
                var plate = Plate.new(index);

                plate.region = GridFill.new(self.grid, index);
                plate.region.seed(point);
                self.plates.push(plate);
            });
        };
    };

    return {
        _class: _Tectonics,

        new: function(size, totalPlates) {
            var tectonics = new _Tectonics(size);
            tectonics.initPlates(totalPlates);
            tectonics.buildPlates();
            return tectonics;
        }
    };
})();



var Plate = (function() {
    var _Plate = function(id) {
        this.id = id;
        this.region = undefined;
        this.speed = _.sample([1, 2, 3, 4, 5]);
        this.weight = _.sample([1, 2]);
        this.direction = Direction.random();
    };

    return {
        _class: _Plate,
        new: function(id) {
            return new _Plate(id);
        }
    };
})();



