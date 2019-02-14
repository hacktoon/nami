
var GridFill = (function() {
    var _GridFill = function(grid, fillValue, callback) {
        var self = this,
            _originalValue = undefined,
            _edges = {},
            _seeds = {};

        this.startPoint = undefined;
        this.points = [];

        this.startAt = function(point) {
            _seeds[point.hash()] = point;
            _edges[point.hash()] = point;
            _originalValue = grid.get(point);
            self.startPoint = point;
            fillPoint(point);
        };

        this.isComplete = function(times) {
            var noSeeds = _.values(_seeds).length === 0,
                timesEnded = _.isNumber(times) && times <= 0;
            return noSeeds || timesEnded;
        };

        this.edgesByDirection = function(direction, callback) {
            var edges = [];

            _.each(_edges, function(edge) {
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
            _.each(_edges, function(edge) {
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
                times = _.isNumber(opts.times) ? opts.times : 1,
                partial = _.defaultTo(opts.partial, false),
                chance = _.defaultTo(opts.chance, false),
                currentSeeds;

            if (chance && _.sample([true, false])) return;
            if (self.isComplete(times)) return;

            currentSeeds = _.clone(_seeds);
            _seeds = {};
            _.each(currentSeeds, function(point){
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
                        _seeds[referencePoint.hash()] = referencePoint;
                        addEdge(referencePoint);
                    } else {
                        fillPoint(neighbor);
                        _seeds[neighbor.hash()] = neighbor;
                        addEdge(neighbor);
                    }
                }
                if (isBlocked(neighbor)) {
                    allNeighborsEqual = false;
                }
            });

            if (allNeighborsEqual) {
                removeEdge(referencePoint);
            }
        };

        var fillPoint = function (point) {
            var isEdge = Boolean(_edges[point.hash()]);
            self.points.push(point);
            grid.set(point, fillValue);
            callback(point, fillValue, isEdge);
        };

        var addEdge = function(point){
            var key = point.hash();
            _edges[key] = point;
        };

        var removeEdge = function(point){
            var key = point.hash();
            delete _edges[key];
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
