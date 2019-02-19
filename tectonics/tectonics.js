
var TectonicsBuilder = function (world, numPlates) {
    var self = this,
        map = new TectonicsMap(world.size),
        growthRate = 15,
        chanceToGrow = true,
        partialGrow = true;

    map.onPlatePoint(function (point, plate) {
        var tile = world.getTile(point);
        tile.plate = plate;
        if (plate.density == 3) {
            world.lowerTerrain(point)
            world.lowerTerrain(point)
            world.lowerTerrain(point)
        }
    });
    map.onPlateEdge(function (point, plate) {
        var tile = world.getTile(point);
        tile.isPlateEdge = true;
    });
    map.initPlates(numPlates);
    map.build(growthRate, chanceToGrow, partialGrow);

    return map;
};


var TectonicsMap = function (size) {
    var self = this;

    this.grid = Grid.new(size, size);
    this.plates = [];
    this.plateIdMap = {};
    this.onFillCallback = _.noop
    this.onPlateEdgeCallback = _.noop

    this.onPlatePoint = function (callback) {
        self.onFillCallback = function(point, fillValue) {
            var plate = self.plateIdMap[fillValue];
            callback(point, plate);
        };
    };

    this.onPlateEdge = function (callback) {
        self.onPlateEdgeCallback = function(point) {
            callback(point);
        };
    };

    this.getPlateById = function (id) {
        return self.plateIdMap[id];
    };

    /* Grow the plates until all them complete. */
    this.build = function (times, chance, isPartial) {
        var totalCompleted = 0,
            completedMap = {},
            chance = _.defaultTo(chance, false);

        while (totalCompleted < self.plates.length) {
            self.plates.forEach(function(plate) {
                if (plate.region.isComplete()) {
                    totalCompleted += completedMap[plate.id] ? 0 : 1;
                    completedMap[plate.id] = 1;
                    return;
                }
                if (chance && _.sample([true, false]))
                    return;
                if (isPartial) {
                    plate.region.growPartial(times);
                } else {
                    plate.region.grow(times);
                }
            });
        }
    };

    this.initPlates = function(numPlates) {
        var eachPoint = function (startPoint, plateId) {
            var plate = new Plate(plateId),
                originalValue = self.grid.get(startPoint);

            function onFill(point){
                self.grid.set(point, plateId);
                self.onFillCallback(point, plateId);
            };

            function isFillable(point, refPoint){
                var value = self.grid.get(point);
                if (value != plateId && value != originalValue){
                    plate.edges.push(refPoint);
                    self.onPlateEdgeCallback(refPoint, point, value);
                }
                return value === originalValue;
            };

            plate.region = new GridFill(startPoint, onFill, isFillable);
            self.plateIdMap[plateId] = plate;
            self.plates.push(plate);
        };
        GridPointDistribution(self.grid, numPlates, eachPoint);
    };
};


var Plate = function(id) {
    var self = this;

    this.id = id;
    this.name = NameGenerator.createLandMassName();
    this.region = undefined;
    this.speed = _.sample([1, 2, 3]);
    this.density = _.sample([1, 1, 2, 2, 3]);
    this.direction = Direction.randomCardinal();
    this.edges = [];

    this.forEachEdge = function(callback) {
        self.edges.forEach(callback);
    };

    this.forEachSeed = function(callback) {
        self.region.seeds.each(callback);
    };
};


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
        new: function(target_plate) {
            return new _PlateDeformation(target_plate);
        }
    };
})();
