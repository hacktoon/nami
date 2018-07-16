
var GridFill = (function() {
    var _GridFill = function(grid, startPoint, fillValue) {
        var self = this,
            originalValue = grid.get(startPoint),
            pointsToExpand = [startPoint],
            borderPoints = [];

        this.points = [startPoint];

        this.isComplete = function() {
            return pointsToExpand.length == 0;
        };

        // this.edgesByDirection = function(direction, callback) {
        //     return self.borderPoints.filter(function(point) {

        //     });
        // };

        this.borderPoints = function(callback) {
            borderPoints.forEach(callback);
            pointsToExpand.forEach(callback);
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
            points.forEach(fillPointNeighbors);
        };

        this.growBy = function(times) {
            var times = _.isNumber(times) ? times : 1,
                count = 0;

            while (! self.isComplete() && count < times) {
                self.grow();
                count++;
            }
        };

        var fillPointNeighbors = function(point) {
            var neighbors = PointNeighborhood.new(point),
                reachedBorder = false;

            neighbors.adjacent(function(neighborPoint, direction) {
                if (canBeFilled(neighborPoint)) {
                    fillPoint(neighborPoint);
                    pointsToExpand.push(neighborPoint);
                }

                if (grid.get(neighborPoint) != fillValue) {
                    reachedBorder = true;
                }
            });

            if (reachedBorder) {
                borderPoints.push(point);
            }
        };

        var canBeFilled = function(point) {
            return grid.get(point) === originalValue;
        };

        var fillPoint = function(point) {
            self.points.push(point);
            grid.set(point, fillValue);
        };
    };

    return {
        new: function(grid, startPoint, fillValue) {
            var gridFill = new _GridFill(grid, startPoint, fillValue);

            grid.set(startPoint, fillValue);
            return gridFill;
        }
    };
})();