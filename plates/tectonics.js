

var Tectonics = (function() {
    var _Tectonics = function(grid) {
        var self = this;

        this.plates = [];
        //TODO  this.subductions = {};

        //TODO this.mountainRanges = {};


    };


    var createPlates = function(tectonics) {
        var totalCompleted = 0,
            completedMap = {};

        while (totalCompleted != tectonics.plates.length) {
            _.each(tectonics.plates, function(plate) {
                if (plate.region.isComplete()) {
                    var plateCompleted = Boolean(completedMap[plate.id]);
                    // TODO  TruthMap
                    totalCompleted += plateCompleted ? 0 : 1;
                    completedMap[plate.id] = 1;
                    return;
                }
                if (_.sample([true, false])) {
                    plate.region.grow({
                        partial: true,
                        times: 4
                    });
                }
            });
        }
        return tectonics;
    };


    return {
        _class: _Tectonics,

        new: function(grid, totalPlates) {
            var points = grid.randomPoints(totalPlates),
                         // TODO: RandomPoints.inGrid
                tectonics = new _Tectonics(grid);

            _.each(points, function(point, index) {
                var plate = Plate.new(index);

                plate.region = GridFill.new(grid, index);
                plate.region.seed(point);
                tectonics.plates.push(plate);
            });
            return createPlates(tectonics);
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



