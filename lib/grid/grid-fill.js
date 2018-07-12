
var GridFill = (function() {
    var _GridFill = function(baseGrid, startPoint, fillValue) {
        var self = this,
            originalValue = baseGrid.get(startPoint),
            growQueue = [startPoint],
            definitiveEdges = [];

        this.points = [startPoint];
        this.northEdges = [];
        this.southEdges = [];
        this.eastEdges = [];
        this.westEdges = [];

        baseGrid.set(startPoint, fillValue);

        this.fill = function() {
            while (! self.isComplete()) {
                self.grow();
            }
        };

        this.isComplete = function() {
            return growQueue.length == 0;
        };

        this.grow = function() {
            if (self.isComplete()) return;

            var newGrowQueue = [];

            growQueue.forEach(function(point) {
                var neighbors = growNeighbors(point);
                newGrowQueue = _.concat(newGrowQueue, neighbors);
            });
            growQueue = newGrowQueue;
        };

        this.growBy = function(times) {
            var times = _.isNumber(times) ? times : 1,
                count = 0;

            while (! self.isComplete() && count < times) {
                self.grow();
                count++;
            }
        };

        this.edges = function() {
            return _.concat(definitiveEdges, growQueue);
        };

        var growNeighbors = function(point) {
            var neighborHood = PointNeighborhood.new(point),
                neighbors = [],
                isEdge = false;

            neighborHood.adjacent(function(neighborPoint, direction) {
                var neighborValue = baseGrid.get(neighborPoint);

                if (neighborValue != originalValue) {
                    if (neighborValue != fillValue) {
                        markEdge(point, direction);
                        isEdge = true;
                    }
                    return;
                }

                fillPoint(neighborPoint);
                neighbors.push(neighborPoint);
            });
            if (isEdge) {
                definitiveEdges.push(point);
            }
            return neighbors;
        };

        var fillPoint = function(point) {
            self.points.push(point);
            baseGrid.set(point, fillValue);
        };

        var markEdge = function(point, direction) {
            var directionName = Direction.getName(direction).toLowerCase();
            self[directionName + 'Edges'].push(point);
        };
    };

    return {
        new: function(baseGrid, startPoint, fillValue) {
            return new _GridFill(baseGrid, startPoint, fillValue);
        }
    };
})();