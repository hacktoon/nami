

var Grid = (function(){
    var _Grid = function(width, height){
        var self = this;

        this.width = width;
        this.height = height;
        this.matrix = [];


        this.build = function(default_value){
            for(var y = 0; y < self.height; y++) {
                self.matrix.push([]);
                for(var x = 0; x < self.width; x++){
                    self.matrix[y].push(default_value);
                }
            }
        };

        this.wrap = function(point){
            var x = point.x,
                y = point.y;
            if (x >= self.width){ x %= self.width; }
            if (y >= self.height){ y %= self.height; }
            if (x < 0){ x = self.width - 1 - Math.abs(x+1) % self.width; }
            if (y < 0){ y = self.height - 1 - Math.abs(y+1) % self.height; }
            return Point.new(x, y);
        };

        this.get = function(point){
            var point = self.wrap(point);
            return self.matrix[point.y][point.x];
        };

        this.set = function(point, value){
            var point = self.wrap(point);
            self.matrix[point.y][point.x] = value;
        };

        this.forEach = function(callback){
            for(var y = 0; y < self.height; y++){
                for(var x = 0; x < self.width; x++){
                    var point = Point.new(x, y),
                        value = self.get(point);
                    callback(value, point);
                }
            }
        };

        this.isEdge = function(point){
            var isTopLeft = point.x === 0 || point.y === 0,
                isBottomRight = point.x === self.width - 1 ||
                                point.y === self.height - 1;
            return isTopLeft || isBottomRight;
        };

        this.oppositeEdge = function(point){
            var x = point.x,
                y = point.y;
            if (! self.isEdge(point)) {
                throw new RangeError("Point not in edge");
            }
            if (point.x === 0) { x = self.width - 1; }
            if (point.x === self.width - 1) { x = 0; }
            if (point.y === 0) { y = self.height - 1; }
            if (point.y === self.height - 1) { y = 0; }
            return Point.new(x, y);
        };
    };

    return {
        new: function(width, height, default_value) {
            var grid = new _Grid(width, height);
            grid.build(default_value);
            return grid;
        }
    };
})();


var GridPointDistribution = function(grid, numPoints, callback){
    var pointsToCreate = _.defaultTo(numPoints, 1),
        maxTries = grid.width * 2,
        chosenPoints = {};

    var hasMinimumDistance = function(point, numPoints){
        var minDistance = (grid.width * 2) / numPoints;
        for(var key in chosenPoints){
            var refPoint = chosenPoints[key];
            var distance = Point.euclidianDistance(point, refPoint);
            if (distance < minDistance) return false;
        };
        return true;
    };

    var createRandomPoint = function() {
        var x = _.random(grid.width-1),
            y = _.random(grid.height-1);
        return Point.new(x, y);
    };

    var addPoint = function(point) {
        chosenPoints[point.hash()] = point;
        callback(point, pointsToCreate--);
    };

    addPoint(createRandomPoint()); // add first point

    while(true){
        if (pointsToCreate == 0 || maxTries-- == 0) break;
        var point = createRandomPoint(),
            hash = point.hash(),
            isMinDistance = hasMinimumDistance(point, numPoints);
        if (_.isUndefined(chosenPoints[hash]) && isMinDistance){
            addPoint(point);
        }
    };

    return chosenPoints;
};