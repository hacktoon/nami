
var GridFill = (function() {
    var _GridFill = function (grid, _fillValue, _fillableValues) {
        var self = this,
            _fillableValues = _.defaultTo(_fillableValues, new TruthMap()),
            _edges = new PointMap(),
            _seeds = new PointMap();

        this.startPoint = undefined;
        this.pointFillCallback = _.noop;
        this.edgeDetectCallback = _.noop;

        this.startAt = function(point) {
            _seeds.add(point);
            _fillableValues.add(grid.get(point));
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

        this.fill = function () {
            while (! self.isComplete()) {
                self.grow();
            }
        };

        this.grow = function (times, isPartial) {
            var times = _.defaultTo(times, 1);
            var isPartial = _.defaultTo(isPartial, false);
            var currentSeeds = _seeds;

            if (self.isComplete(times)) return;

            _seeds = new PointMap();
            currentSeeds.each(function(point){
                growNeighbors(point, isPartial);
            });
            if (times > 1) {
                self.grow(times - 1, isPartial);
            }
        };

        var growNeighbors = function (referencePoint, isPartial) {
            PointNeighborhood.new(referencePoint)
            .adjacent(function(neighbor) {
                if (isEdge(neighbor)) {
                    _edges.add(referencePoint);
                    self.edgeDetectCallback(referencePoint);
                    return;
                }
                if (canBeFilled(neighbor)) {
                    if (isPartial && _.sample([true, false])) {
                        _seeds.add(referencePoint);
                    } else {
                        _seeds.add(neighbor);
                        fillPoint(neighbor);
                    }
                }
            });
        };

        var fillPoint = function (point) {
            grid.set(point, _fillValue);
            self.pointFillCallback(point, _fillValue);
        };

        var isEdge = function (point) {
            var value = grid.get(point);
            return !_fillableValues.has(value) && value != _fillValue;
        };

        var canBeFilled = function(point) {
            return _fillableValues.has(grid.get(point));
        };
    };

    return {
        new: function(grid, _) {
            return new _GridFill(grid, _);
        }
    };
})();



var FreeFill = (function() {
    var _FreeFill = function (point, callback) {
        var self = this,
            _points = new PointMap(),
            _seeds = new PointMap();

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

            _seeds = new PointMap();
            currentSeeds.each(function(point){
                growNeighbors(point, isPartial);
            });
            if (times > 1) {
                self.grow(times - 1, isPartial);
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


var GridFill2 = (function () {
    var _GridFill = function (point, onFill, isFillable) {
        var onFill = _.defaultTo(onFill, _.noop);
        var isFillable = _.defaultTo(isFillable, _.stubTrue);
        var self = this;

        this.seeds = new PointMap(point);
        this.startPoint = point;

        this.isComplete = function (times) {
            var noSeeds = self.seeds.size() === 0,
                timesEnded = _.isNumber(times) && times <= 0;
            return noSeeds || timesEnded;
        };

        this.fill = function () {
            while (!self.isComplete()) {
                self.grow();
            }
        };

        this.grow = function (times) {
            grow(times, false);
        };

        this.growPartial = function (times) {
            grow(times, true);
        };

        var grow = function (times, isPartial) {
            var times = _.defaultTo(times, 1);
            var currentSeeds = self.seeds;

            if (self.isComplete(times)) return;

            self.seeds = new PointMap();
            currentSeeds.each(function (point) {
                growNeighbors(point, isPartial);
            });
            if (times > 1) {
                self.grow(times - 1, isPartial);
            }
        };

        var growNeighbors = function (referencePoint, isPartial) {
            PointNeighborhood.new(referencePoint)
                .adjacent(function (neighbor) {
                    if (!isFillable(referencePoint, neighbor)) return;

                    if (isPartial && _.sample([true, false])) {
                        self.seeds.add(referencePoint);
                    } else {
                        self.seeds.add(neighbor);
                        onFill(referencePoint, neighbor);
                    }
                });
        };
    };

    return {
        new: function (point, action, isFillable) {
            return new _GridFill(point, action, isFillable);
        }
    };
})();
