
var GridFill = (function() {
    var _GridFill = function(grid, fillValue) {
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
                growNeighbors(point, opts);
            });
            if (opts.times > 1) {
                this.grow({times: opts.times - 1, partial: opts.partial});
            }
        };

        var growNeighbors = function(referencePoint, opts) {
            var neighbors = PointNeighborhood.new(referencePoint);

            neighbors.adjacent(function(neighbor) {
                if (canBeFilled(neighbor)) {
                    if (opts.isPartial && ! shouldFill()) {
                        _seeds.add(referencePoint);
                    } else {
                        fillPoint(neighbor);
                        _seeds.add(neighbor);
                    }
                } else {
                    _edges.add(referencePoint);
                    opts.callback(referencePoint);
                }
            });
        };

        var sanitizeOptions = function(rawOpts) {
            var opts = _.defaultTo(rawOpts, {});
            opts.times = _.isNumber(opts.times) ? _.parseInt(opts.times) : 1,
            opts.partial = _.defaultTo(opts.partial, false),
            opts.chance = _.defaultTo(opts.chance, false);
            opts.callback = _.defaultTo(opts.callback, _.noop);
            return opts;
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
    };

    return {
        new: function(grid, fillValue) {
            return new _GridFill(grid, fillValue);
        }
    };
})();
