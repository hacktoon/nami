
var GridFill = (function() {
    var _GridFill = function(grid, fillValue, callback) {
        var self = this,
            _originalValue = undefined,
            _definitiveEdges = PointMap.new(),
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

                if (isNotFilled(neighborAtDirection)) {
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
            var opts = sanitizeOptions(opts);

            if (self.isComplete(opts.times)) return;
            if (opts.chance && _.sample([true, false])) return;

            var currentSeeds = _.clone(_seeds);
            _seeds = PointMap.new();
            currentSeeds.each(function(point){
                growNeighbors(point, opts.partial);
            });
            if (opts.times > 1) {
                this.grow({times: opts.times - 1, partial: opts.partial});
            }
        };

        var sanitizeOptions = function(rawOpts) {
            var opts = _.defaultTo(rawOpts, {});
            opts.times = _.isNumber(opts.times) ? _.parseInt(opts.times) : 1,
            opts.partial = _.defaultTo(opts.partial, false),
            opts.chance = _.defaultTo(opts.chance, false);
            return opts;
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
                if (isNotFilled(neighbor)) {
                    allNeighborsEqual = false;
                    if (! canBeFilled(neighbor)) {
                        _definitiveEdges.add(referencePoint);
                    }
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

        var isNotFilled = function(point) {
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
