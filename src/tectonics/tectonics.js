
var TectonicsBuilder = function (world, numPlates) {
    var map = new Tectonics(world.size),
        growthRate = 15,
        chanceToGrow = true,
        partialGrow = true;

    map.onPlatePoint(function (point, plate, step) {
        var tile = world.getTile(point);
        tile.plate = plate;
        if (plate.isDenser()){
            var h =  world.getTile(point).height
            world.lowerTerrain(point, h/2);
        }
    });

    map.onPlateEdgeDetect(function (point, plate, step) {
        var tile = world.getTile(point);
        tile.isPlateEdge = true;
        world.raiseTerrain(point, _.random(10, 50));
    });

    map.initPlates(numPlates);
    map.build(growthRate, chanceToGrow, partialGrow);

    return map;
};


var Tectonics = function (size) {
    var self = this;

    this.grid = new Grid(size, size);
    this.plates = [];
    this.plateIdMap = {};
    this.onFillCallback = _.noop
    this.onPlateEdgeCallback = _.noop

    this.onPlatePoint = function (callback) {
        self.onFillCallback = function(point, fillValue, step) {
            var plate = self.plateIdMap[fillValue];
            callback(point, plate, step);
        };
    };

    this.onPlateEdgeDetect = function (callback) {
        self.onPlateEdgeCallback = function(edge, outerEdge, step) {
            var plate = self.getPlateByPoint(edge);
            var otherPlate = self.getPlateByPoint(outerEdge);
            callback(edge, outerEdge, step);
        };
    };

    this.getPlateById = function (id) {
        return self.plateIdMap[id];
    };

    this.getPlateByPoint = function (point) {
        var id = self.grid.get(point);
        return self.getPlateById(id);
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
        function eachPoint(startPoint, plateId) {
            var plate = new Plate(plateId),
                originalValue = self.grid.get(startPoint);

            function onFill(neighbor, point, step){
                self.grid.set(neighbor, plateId);
                self.onFillCallback(neighbor, plateId, step);
            };

            function isFillable(neighbor, point, step){
                var neighborValue = self.grid.get(neighbor);
                if (neighborValue != plateId && neighborValue != originalValue){
                    plate.edges.push(point);
                    self.onPlateEdgeCallback(point, neighbor, step);
                    return false;
                }
                return neighborValue === originalValue;
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

    this.isDenser = function() {
        return self.density === 3;
    };

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
