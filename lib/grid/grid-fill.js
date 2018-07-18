
var GridFill = (function() {
    var _GridFill = function(grid, startPoint, fillValue) {
        var self = this,
            originalValue = grid.get(startPoint),
            pointsToGrow = [startPoint],
            _edges = [],
            _edgesByDirection = {
                NORTH: [],
                EAST: [],
                SOUTH: [],
                WEST: []
            },
            pointsToGrowbyDirection = {
                NORTH: [],
                EAST: [],
                SOUTH: [],
                WEST: []
            };

        this.points = [startPoint];

        this.isComplete = function() {
            return pointsToGrow.length == 0;
        };

        this.edgesByDirection = function(direction, callback) {
            var edges = _.clone(_edgesByDirection[direction]);
                addEdge = function(point) {
                    edges.push(point);
                    callback(point);
                };
            _edges.forEach(addEdge);
            pointsToGrowbyDirection[direction].forEach(addEdge);
            return edges;
        };

        this.edges = function(callback) {
            var edges = [],
                addEdge = function(point) {
                    edges.push(point);
                    callback(point);
                };
            _edges.forEach(addEdge);
            pointsToGrow.forEach(addEdge);
            return edges;
        };

        this.fill = function() {
            while (! self.isComplete()) {
                self.grow();
            }
        };

        this.grow = function() {
            var points = pointsToGrow;

            if (self.isComplete()) return;

            initGrowStep();
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
                isEdge = false,
                edgeDirection = undefined;

            neighbors.adjacent(function(neighborPoint, direction) {
                var direction = Direction.getName(direction);

                if (canBeFilled(neighborPoint)) {
                    fillPoint(neighborPoint);
                    pointsToGrow.push(neighborPoint);
                    pointsToGrowbyDirection[direction].push(neighborPoint);
                } else {
                    if (isDifferentFill(neighborPoint)) {
                        isEdge = true;
                        edgeDirection = direction;
                    }
                }
            });

            if (isEdge) {
                _edges.push(point);
                _edgesByDirection[edgeDirection].push(point);
            }
        };

        var initGrowStep = function() {
            pointsToGrow = [];
            pointsToGrowbyDirection = {
                NORTH: [],
                EAST: [],
                SOUTH: [],
                WEST: []
            };
        };

        var canBeFilled = function(point) {
            return grid.get(point) === originalValue;
        };

        var isDifferentFill = function(point) {
            return grid.get(point) != fillValue;
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