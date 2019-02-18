
var GridFill = (function() {
    var _GridFill = function (grid, fillValue) {
        var self = this,
            _originalValue = undefined,
            _edges = PointMap.new(),
            _seeds = PointMap.new();

        this.startPoint = undefined;
        this.pointFillCallback = _.noop;
        this.edgeDetectCallback = _.noop;

        this.startAt = function(point) {
            _seeds.add(point);
            _originalValue = grid.get(point);
            self.startPoint = point;
            fillPoint(point);
        };

        this.onPointFill = function(callback) {
            self.pointFillCallback = callback;
        };

        this.onEdgeDetect = function(callback) {
            self.edgeDetectCallback = callback;
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
            var currentSeeds = _seeds;

            if (self.isComplete(times)) return;
            if (chance && _.sample([true, false])) return;

            _seeds = PointMap.new();
            currentSeeds.each(function(point){
                growNeighbors(point, isPartial);
            });
            if (times > 1) {
                self.grow(times - 1, false, isPartial);
            }
        };

        var growNeighbors = function (referencePoint, isPartial) {
            PointNeighborhood.new(referencePoint)
            .adjacent(function(neighbor) {
                if (isFilled(neighbor)) return;
                if (canBeFilled(neighbor)) {
                    if (isPartial && _.sample([true, false])) {
                        _seeds.add(referencePoint);
                    } else {
                        _seeds.add(neighbor);
                        fillPoint(neighbor);
                    }
                } else {
                    _edges.add(referencePoint);
                    self.edgeDetectCallback(referencePoint);
                }
            });
        };

        var fillPoint = function (point) {
            grid.set(point, fillValue);
            self.pointFillCallback(point, fillValue);
        };

        var canBeFilled = function(point) {
            return grid.get(point) === _originalValue;
        };

        var isFilled = function (point) {
            return grid.get(point) === fillValue;
        };
    };

    return {
        new: function(grid, fillValue) {
            return new _GridFill(grid, fillValue);
        }
    };
})();



var FreeFill = (function() {
    var _FreeFill = function (point, callback) {
        var self = this,
            _points = PointMap.new(),
            _seeds = PointMap.new();

        this.step = 0;
        this.originalPoint = point;
        this.pointFillCallback = _.defaultTo(callback, _.noop);

        this.startAt = function() {
            _seeds.add(self.originalPoint);
            _points.add(self.originalPoint);
            self.pointFillCallback(self.originalPoint, self.step);
            self.step++;
        };

        this.seeds = function(callback) {
            var seeds = [];
            _seeds.each(function(point) {
                _.isFunction(callback) && callback(point);
                seeds.push(point);
            });
            return seeds;
        };

        this.points = function(callback) {
            var points = [];
            _points.each(function(point) {
                _.isFunction(callback) && callback(point);
                points.push(point);
            });
            return points;
        };

        this.grow = function (times, isPartial) {
            var times = _.defaultTo(times, 1);
            var isPartial = _.defaultTo(isPartial, false);
            var currentSeeds = _seeds;

            _seeds = PointMap.new();
            currentSeeds.each(function(point){
                growNeighbors(point, isPartial);
            });
            if (times > 1) {
                self.grow(times - 1, false, isPartial);
            }
            self.step++;
        };

        var growNeighbors = function (referencePoint, isPartial) {
            PointNeighborhood.new(referencePoint)
            .adjacent(function(neighbor) {
                if (_points.has(neighbor)) return;

                if (isPartial && _.sample([true, false])) {
                    _seeds.add(referencePoint);
                } else {
                    _seeds.add(neighbor);
                    _points.add(neighbor);
                    self.pointFillCallback(neighbor, self.step);
                }
            });
        };
    };

    return {
        new: function(point, callback) {
            var grow = new _FreeFill(point, callback);
            grow.startAt(point);
            return grow;
        }
    };
})();
