
var GridFill = (function() {
    var _GridFill = function(grid, fillValue, callback) {
        var self = this,
            _originalValue = undefined,
            _edges = PointMap.new(),
            _seeds = PointMap.new();

        this.startPoint = undefined;

        this.startAt = function(point) {
            _seeds.add(point);
            _originalValue = grid.get(point);
            self.startPoint = point;
            fillPoint(point);
            callback(point, fillValue);
        };

        this.isComplete = function(times) {
            var noSeeds = _seeds.size() === 0,
                timesEnded = _.isNumber(times) && times <= 0;
            return noSeeds || timesEnded;
        };

        this.edges = function(callback) {
            var edges = [];
            _edges.each(function(point) {
                _.isFunction(callback) && callback(point);
                edges.push(point);
            });
            return edges;
        };

        this.seeds = function(callback) {
            var seeds = [];
            _seeds.each(function(point) {
                _.isFunction(callback) && callback(point);
                seeds.push(point);
            });
            return seeds;
        };

        this.fill = function (times, chance, isPartial) {
            while (! self.isComplete()) {
                self.grow(times, chance, isPartial);
            }
        };

        this.grow = function (times, chance, isPartial) {
            var times = _.defaultTo(times, 1);
            var isPartial = _.defaultTo(isPartial, false);
            var chance = _.defaultTo(chance, false);

            if (self.isComplete(times)) return;
            if (chance && _.sample([true, false])) return;

            var currentSeeds = _.clone(_seeds);
            _seeds = PointMap.new();
            currentSeeds.each(function(point){
                growNeighbors(point, isPartial);
            });
            if (times > 1) {
                this.grow(times - 1, false, isPartial);
            }
        };

        var growNeighbors = function (referencePoint, isPartial) {
            var neighbors = PointNeighborhood.new(referencePoint);
            neighbors.adjacent(function(neighbor) {
                if (canBeFilled(neighbor)) {
                    if (isPartial && ! shouldFill()) {
                        _seeds.add(referencePoint);
                    } else {
                        fillPoint(neighbor);
                        callback(referencePoint, fillValue);
                        _seeds.add(neighbor);
                    }
                } else {
                    if (isFilled(neighbor)) return;
                    var isEdge = true;
                    _edges.add(referencePoint);
                    callback(referencePoint, fillValue, isEdge);
                }
            });
        };

        var fillPoint = function (point) {
            grid.set(point, fillValue);
        };

        var canBeFilled = function(point) {
            return grid.get(point) === _originalValue;
        };

        var shouldFill = function() {
            return _.sample([true, false]);
        };

        var isFilled = function (point) {
            return grid.get(point) === fillValue;
        };
    };

    return {
        new: function(grid, fillValue, callback) {
            return new _GridFill(grid, fillValue, callback);
        }
    };
})();
