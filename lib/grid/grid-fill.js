
var GridFill = (function() {
    var _GridFill = function(grid, fillValue, callback) {
        var self = this,
            _originalValue = undefined,
            _edges = PointMap.new(),
            _seeds = PointMap.new();

        this.startPoint = undefined;

        this.startAt = function(point) {
            _seeds.add(point);
            _edges.add(point);
            _originalValue = grid.get(point);
            self.startPoint = point;
            fillPoint(point);
        };

        this.isComplete = function(times) {
            var noSeeds = _seeds.size() === 0,
                timesEnded = _.isNumber(times) && times <= 0;
            return noSeeds || timesEnded;
        };

        this.edgesByDirection = function(direction, callback) {
            var edges = [];

            _edges.each(function(edge) {
                var neighbor = PointNeighborhood.new(edge),
                    neighborAtDirection = neighbor.atDirection(direction);

                if (isBlocked(neighborAtDirection)) {
                    edges.push(edge);
                    _.isFunction(callback) && callback(edge);
                }
            });
            return edges;
        };

        this.edges = function(callback) {
            var edges = [];
            _edges.each(function(edge) {
                _.isFunction(callback) && callback(edge);
                edges.push(edge);
            });
            return edges;
        };

        this.fill = function(opts) {
            while (! self.isComplete()) {
                self.grow(opts);
            }
        };

        this.grow = function(opts) {
            var opts = opts || {},
                times = _.isNumber(opts.times) ? _.parseInt(opts.times) : 1,
                partial = _.defaultTo(opts.partial, false),
                chance = _.defaultTo(opts.chance, false),
                currentSeeds;

            if (self.isComplete(times)) return;
            if (chance && _.sample([true, false])) return;

            currentSeeds = _.clone(_seeds);
            _seeds = PointMap.new();
            currentSeeds.each(function(point){
                growNeighbors(point, partial);
            });
            if (times > 1) {
                this.grow({times: times - 1, partial: partial});
            }
        };

        var growNeighbors = function(referencePoint, isPartial) {
            var neighbors = PointNeighborhood.new(referencePoint),
                allNeighborsEqual = true;

            neighbors.adjacent(function(neighbor) {
                if (canBeFilled(neighbor)) {
                    if (isPartial && ! shouldFill()) {
                        _seeds.add(referencePoint);
                        _edges.add(referencePoint);
                    } else {
                        fillPoint(neighbor);
                        _seeds.add(neighbor);
                        _edges.add(neighbor);
                    }
                }
                if (isBlocked(neighbor)) {
                    allNeighborsEqual = false;
                }
            });

            if (allNeighborsEqual) {
                _edges.remove(referencePoint);
            }
        };

        var fillPoint = function (point) {
            var isEdge = _edges.has(point);
            grid.set(point, fillValue);
            callback(point, fillValue, isEdge);
        };

        var canBeFilled = function(point) {
            return grid.get(point) === _originalValue;
        };

        var shouldFill = function() {
            return _.sample([true, false]);
        };

        var isBlocked = function(point) {
            return grid.get(point) != fillValue;
        };
    };

    return {
        new: function(grid, fillValue, callback) {
            var callback = _.defaultTo(callback, function(){});
            return new _GridFill(grid, fillValue, callback);
        }
    };
})();
