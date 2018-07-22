
var GridFill = (function() {
    var _GridFill = function(grid, startPoint, fillValue) {
        var self = this,
            originalValue = grid.get(startPoint),
            pointsToGrow = [startPoint],
            pointsToGrowbyDirection = {
                NORTH: [],
                EAST: [],
                SOUTH: [],
                WEST: []
            },
            _edges = [],
            _edgesByDirection = {
                NORTH: [],
                EAST: [],
                SOUTH: [],
                WEST: []
            };

        this.points = [startPoint];

        this.startAt = function(point) {
            startPoint = point;
            originalValue = grid.get(point);
            pointsToGrow.push(point);
        };

        this.isComplete = function() {
            return pointsToGrow.length === 0;
        };

        this.edgesByDirection = function(direction, callback) {
            var direction = Direction.getName(direction);
                points = _.clone(_edgesByDirection[direction]),
                addEdge = function(point) {
                    points.push(point);
                    callback(point);
                };

            if (self.isComplete()) {
                _edgesByDirection[direction].forEach(addEdge);
                return points;
            }

            _edgesByDirection[direction].forEach(addEdge);
            pointsToGrowbyDirection[direction].forEach(addEdge);
            return points;
        };

        this.edges = function(callback) {
            var edges = [],
                addEdge = function(point) {
                    edges.push(point);
                    if (_.isFunction(callback)) {
                        callback(point);
                    }
                };

            if (self.isComplete()) {
                _edges.forEach(addEdge);

                return edges;
            }

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

            resetPointsToGrow();
            points.forEach(growNeighbors);
        };

        this.growBy = function(times) {
            var times = _.isNumber(times) ? times : 1,
                count = 0;

            while (! self.isComplete() && count < times) {
                self.grow();
                count++;
            }
        };

        var checkNeighborhood = function(referencePoint) {
            var info = {points: [], empty: [], isBlocked: false};
            var neighborPoints = PointNeighborhood.new(referencePoint);
            var checkNeighbor = function(neighborPoint, direction){
                var canBeFilled = grid.get(neighborPoint) === originalValue;
                var isDifferentFill = grid.get(neighborPoint) != fillValue;

                if (canBeFilled) {
                    info.empty.push(neighborPoint);
                } else if (isDifferentFill) {
                    info.isBlocked = true;
                }
                info.points.push(neighborPoint);
            };
            neighborPoints.adjacent(checkNeighbor);
            return info;
        };

        var growNeighbors = function(point) {
            var neighbors = PointNeighborhood.new(point),
                candidateEdge = false,
                edgeNeighborDirections = [];

            neighbors.adjacent(function(neighborPoint, direction) {
                var direction = Direction.getName(direction);

                if (canBeFilled(neighborPoint)) {
                    fillPoint(neighborPoint);
                    addPointToGrow(neighborPoint, direction);

                } else if (isDifferentFill(neighborPoint)) {
                    candidateEdge = true;
                    edgeNeighborDirections.push(direction);
                }
            });

            if (candidateEdge) {
                _edges.push(point);
                edgeNeighborDirections.forEach(function(direction) {
                    _edgesByDirection[direction].push(point);
                })
            }
        };

        var resetPointsToGrow = function() {
            pointsToGrow = [];
            pointsToGrowbyDirection = {
                NORTH: [],
                EAST: [],
                SOUTH: [],
                WEST: []
            };
        };

        var addPointToGrow = function(point, direction) {
            pointsToGrow.push(point);
            pointsToGrowbyDirection[direction].push(point);
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