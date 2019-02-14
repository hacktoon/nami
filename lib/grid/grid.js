

var Grid = (function(){
    var _Grid = function(){
        var self = this;

        this.matrix = [];
        this.width = 0;
        this.height = 0;

        this.wrap = function(point){
            var x = point.x,
                y = point.y;
            if (x >= this.width){ x %= this.width; }
            if (y >= this.height){ y %= this.height; }
            if (x < 0){ x = this.width - 1 - Math.abs(x+1) % this.width; }
            if (y < 0){ y = this.height - 1 - Math.abs(y+1) % this.height; }
            return Point.new(x, y);
        };

        this.get = function(point){
            var point = this.wrap(point);
            return this.matrix[point.y][point.x];
        };

        this.set = function(point, value){
            var point = this.wrap(point);
            this.matrix[point.y][point.x] = value;
        };

        this.reset = function(value){
            var self = this,
                value = value || undefined;
            this.forEach(function(_, point) {
                self.set(point, value);
            });
        };

        this.forEach = function(callback){
            for(var y = 0; y < this.height; y++){
                for(var x = 0; x < this.width; x++){
                    callback(this.get(Point.new(x, y)), Point.new(x, y));
                }
            }
        };

        this.inEdge = function(point){
            var isTopLeft = point.x === 0 || point.y === 0,
                isBottomRight = point.x === this.width - 1 ||
                              point.y === this.height - 1;
            return isTopLeft || isBottomRight;
        };

        this.oppositeEdge = function(point){
            var x = point.x,
                y = point.y;
            if (! this.inEdge(point)) {
                throw new RangeError("Point not in edge");
            }
            if (point.x === 0) { x = this.width - 1; }
            if (point.x === this.width - 1) { x = 0; }
            if (point.y === 0) { y = this.height - 1; }
            if (point.y === this.height - 1) { y = 0; }
            return Point.new(x, y);
        };

        this.randomPoints = function(numPoints) {
            var firstPoint = createRandomPoint(),
                pointsToCreate = _.defaultTo(numPoints, 1) - 1,
                chosenPoints = {},
                maxTries = self.width * 2;

            chosenPoints[firstPoint.hash()] = firstPoint;
            while(true){
                if (pointsToCreate == 0 || maxTries-- == 0) break;
                var point = createRandomPoint(),
                    hash = point.hash(),
                    isMinDistance = hasMinimumDistance(point, chosenPoints, numPoints);
                if (_.isUndefined(chosenPoints[hash]) && isMinDistance){
                    chosenPoints[hash] = point;
                    pointsToCreate--;
                }
            }
            return _.values(chosenPoints);
        };

        var hasMinimumDistance = function(point, points, numPoints){
            var minDistance = (self.width * 2) / numPoints;
            for(var key in points){
                var refPoint = points[key];
                var distance = Point.euclidianDistance(point, refPoint);
                if (distance < minDistance) return false;
            };
            return true;
        };

        var createRandomPoint = function() {
            var x = _.random(self.width-1),
                y = _.random(self.height-1);
            return Point.new(x, y);
        };
    };

    return {
        new: function(width, height, default_value) {
            var grid = new _Grid();

            grid.width = width;
            grid.height = height;

            for(var y = 0; y < height; y++) {
                grid.matrix.push([]);
                for(var x = 0; x < width; x++){
                    grid.matrix[y].push(default_value);
                }
            }
            return grid;
        },
        from: function(matrix) {
            var grid = new _Grid();

            grid.matrix = matrix;
            grid.width = matrix[0].length;
            grid.height = matrix.length;

            return grid;
        }
    };
})();