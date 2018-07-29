

var Tectonics = (function() {
    var _Tectonics = function(grid) {
        this.plates = [];
        this.plateRegionḾap = {};
        //TODO  this.subductions = {};

        //TODO this.mountainRanges = {};

        this.
    };

    return {
        _class: _Tectonics,
        createPlates: function(totalPlates) {
            var totalCompleted = 0,
                completedMap = {};

            while (totalCompleted != totalPlates) {
                plates.forEach(function(plate) {
                    var region = plateRegionMap[plate.id];
                    if (region.isComplete()) {
                        totalCompleted += Boolean(completedMap[plate.id]) ? 0 : 1;
                        completedMap[plate.id] = 1;
                        return;
                    }
                    grow(region);
                });
            }
        },

        new: function(grid, totalPlates) {
            var points = grid.randomPoints(totalPlates),
                tectonics = new _Tectonics(grid);

            _.times(totalPlates, function(index) {
                var plate = Plate.new(index),
                    region = GridFill.new(grid, index);

                region.seed(plate.points[index]);
                tectonics.plateRegionMap[index] = region;
                tectonics.plates.push(plate);

            });
            return tectonics;
        }
    };
})();



var Plate = (function() {
    var _Plate = function(id) {
        this.id = id;
        this.points = [];
        this.speed = _.sample([1, 2, 3, 4, 5]);
        this.weight = _.sample([1, 2]);
        this.direction = Direction.random();

        this.createPlates = function(grid, totalPlates) {
            var points = grid.randomPoints(totalPlates),
                plates = [];

            _.times(totalPlates, function(index) {
                var plate = Plate.new(index),
                    region = GridFill.new(grid, index);

                region.seed(points[index]);
                plateRegionMap[index] = region;
                plates.push(plate);
            });
            return plates;
        };
    };

    return {
        _class: _Plate,
        new: function(id) {
            return new _Plate(id);
        }
    };
})();



