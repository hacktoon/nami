
var GridFill = (function() {
    var _GridFill = function(grid, startPoint, fillValue) {
        var self = this,
            originalValue = grid.get(startPoint),
            pointsToExpand = [startPoint];

        this.points = [];
        this.edges = [];

        this.isComplete = function() {
            return pointsToExpand.length == 0;
        };

        this.edgesByDirection = function(direction, callback) {
            return self.edges.filter(function(point) {

            });
        };

        this.fill = function() {
            while (! self.isComplete()) {
                self.grow();
            }
        };

        this.grow = function() {
            var points = pointsToExpand;

            if (self.isComplete()) return;

            pointsToExpand = [];
            points.forEach(fillNeighbors);
            this.edges = pointsToExpand;
        };

        this.growBy = function(times) {
            var times = _.isNumber(times) ? times : 1,
                count = 0;

            while (! self.isComplete() && count < times) {
                self.grow();
                count++;
            }
        };

        var fillNeighbors = function(point) {
            var neighbors = PointNeighborhood.new(point);

            neighbors.adjacent(function(neighborPoint, direction) {
                var neighbourValue = grid.get(neighborPoint);

                if (neighbourValue == originalValue) {
                    fillPoint(neighborPoint);
                    pointsToExpand.push(neighborPoint);
                }
                checkBorder(point, neighborPoint, direction);
            });
        };

        var fillPoint = function(point) {
            self.points.push(point);
            grid.set(point, fillValue);
        };

        var checkBorder = function(point, neighborPoint) {

        };

        fillPoint(startPoint);
    };

    return {
        new: function(grid, startPoint, fillValue) {
            return new _GridFill(grid, startPoint, fillValue);
        }
    };
})();