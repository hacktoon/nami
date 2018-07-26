
var GridFill = (function() {
    var _GridFill = function(grid, fillValue) {
        var self = this,
            _originalValue = undefined,
            _edges = {},
            _seeds = {};

        this.points = [];

        this.seed = function(point) {
            _seeds[point.hash()] = point;
            _edges[point.hash()] = point;
            _originalValue = grid.get(point);
            fillPoint(point);
        };

        this.isComplete = function(times) {
            var x = _.values(_seeds).length === 0,
                iterationsEnded = times && times === 0;
            return x || iterationsEnded;
        };

        this.edgesByDirection = function(direction, callback) {
            var edges = [];

            _.mapValues(_edges, function(edge) {
                var point = PointNeighborhood.new(edge).atDirection(direction);

                if (isBlocked(point)) {
                    edges.push(point);
                    if (_.isFunction(callback)) {
                        callback(edge);
                    }
                }
            });
            return edges;
        };

        this.edges = function(callback) {
            var edges = [];

            _.mapValues(_edges, function(edge) {
                if (_.isFunction(callback)) {
                    callback(edge);
                }
                edges.push(edge);
            });
            return edges;
        };

        this.fill = function() {
            self.grow();
            while (! self.isComplete()) {
                self.grow();
            }
        };

        this.grow = function(opts) {
            var opts = opts || {},
                times = _.isNumber(opts.times) ? opts.times : 1,
                partial = _.defaultTo(opts.partial, false),
                currentSeeds;

            if (self.isComplete(times)) return;

            currentSeeds = _.clone(_seeds);
            _seeds = {};
            _.each(currentSeeds, function(point){
                growNeighbors(point, partial, undefined);
            });
            if (times > 1) {
                this.grow({times: times - 1, partial: partial});
            }
        };

        var fillPoint = function(point) {
            self.points.push(point);
            grid.set(point, fillValue);
        };

        var growNeighbors = function(referencePoint, partial, callback) {
            var neighbors = PointNeighborhood.new(referencePoint),
                allNeighborsEqual = true;

            neighbors.adjacent(function(neighbor) {
                if (isBlocked(neighbor)) {
                    allNeighborsEqual = false;
                }
                if (canBeFilled(neighbor)) {
                    if (partial && ! shouldFill()) {
                        _seeds[referencePoint.hash()] = referencePoint;
                        _edges[referencePoint.hash()] = referencePoint;
                        return;
                    }
                    fillPoint(neighbor);
                    _seeds[neighbor.hash()] = neighbor;
                    _edges[neighbor.hash()] = neighbor;
                }
            });

            if (allNeighborsEqual) {
                delete _edges[referencePoint.hash()];
            }
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
        new: function(grid, fillValue) {
            return new _GridFill(grid, fillValue);
        }
    };
})();