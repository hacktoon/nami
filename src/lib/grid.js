
class Grid {
    constructor(width, height, defaultValue) {
        this.width = width;
        this.height = height;
        this.matrix = [];

        for(var y = 0; y < this.height; y++) {
            this.matrix.push([]);
            for(var x = 0; x < this.width; x++){
                this.matrix[y].push(defaultValue);
            }
        }
    }

    get (point) {
        let p = this.wrap(point);
        return this.matrix[p.y][p.x];
    }

    set (point, value) {
        let p = this.wrap(point);
        this.matrix[p.y][p.x] = value;
    }

    wrap (point) {
        let x = point.x,
            y = point.y;
        if (x >= this.width){ x %= this.width; }
        if (y >= this.height){ y %= this.height; }
        if (x < 0){ x = this.width - 1 - Math.abs(x+1) % this.width; }
        if (y < 0){ y = this.height - 1 - Math.abs(y+1) % this.height; }
        return Point.new(x, y);
    }

    forEach (callback) {
        for(var y = 0; y < this.height; y++){
            for(var x = 0; x < this.width; x++){
                var point = Point.new(x, y),
                    value = this.get(point);
                callback(value, point);
            }
        }
    }

    isEdge (point) {
        var isTopLeft = point.x === 0 || point.y === 0,
            isBottomRight = point.x === this.width - 1 ||
                            point.y === this.height - 1;
        return isTopLeft || isBottomRight;
    }

    oppositeEdge (point) {
        var x = point.x,
            y = point.y;
        if (! this.isEdge(point)) {
            throw new RangeError("Point not in edge");
        }
        if (point.x === 0) { x = this.width - 1; }
        if (point.x === this.width - 1) { x = 0; }
        if (point.y === 0) { y = this.height - 1; }
        if (point.y === this.height - 1) { y = 0; }
        return Point.new(x, y);
    }
}


class GridPointDistribution {
    constructor (grid, numPoints) {
        this.grid = grid;
        this.numPoints = _.defaultTo(numPoints, 1);
        this.maxTries = grid.width * 2;
        this.chosenPoints = {};
    }

    hasMinimumDistance (point) {
        let minDistance = (this.grid.width * 2) / this.numPoints;
        for(let key in this.chosenPoints){
            let refPoint = this.chosenPoints[key];
            let distance = Point.manhattanDistance(point, refPoint);
            if (distance < minDistance) return false;
        }
        return true;
    }

    createRandomPoint () {
        let x = _.random(this.grid.width-1),
            y = _.random(this.grid.height-1);
        return Point.new(x, y);
    }

    each (callback) {
        const addPoint = (point) => {
            this.chosenPoints[point.hash()] = point;
            callback(point, this.numPoints--);
        }
        addPoint(this.createRandomPoint());
        while(true){
            if (this.numPoints == 0 || this.maxTries-- == 0) break;
            let point = this.createRandomPoint(),
                hash = point.hash(),
                isMinDistance = this.hasMinimumDistance(point);
            if (_.isUndefined(this.chosenPoints[hash]) && isMinDistance){
                addPoint(point);
            }
        };
        return this.chosenPoints;
    }
}


var GridFill = function (point, onFill, isFillable) {
    var onFill = _.defaultTo(onFill, _.noop);
    var isFillable = _.defaultTo(isFillable, _.stubTrue);
    var self = this;

    this.step = 0;
    this.seeds = new PointMap(point);
    this.startPoint = point;

    this.isComplete = function (times) {
        var noSeeds = self.seeds.size() === 0,
            timesEnded = _.isNumber(times) && times <= 0;
        return noSeeds || timesEnded;
    };

    this.fill = function () {
        while (!self.isComplete()) {
            self.grow();
        }
    };

    this.grow = function (times) {
        grow(times, false);
    };

    this.growPartial = function (times) {
        grow(times, true);
    };

    var grow = function (times, isPartial) {
        var times = _.defaultTo(times, 1);
        var currentSeeds = self.seeds;

        if (self.isComplete(times)) return;

        self.seeds = new PointMap();
        currentSeeds.each(function (point) {
            growNeighbors(point, isPartial);
        });
        if (times > 1) {
            var grow = isPartial ? self.growPartial : self.grow;
            grow(times - 1);
        }
        self.step++;
    };

    var growNeighbors = function (referencePoint, isPartial) {
        PointNeighborhood.new(referencePoint)
        .adjacent(function (neighbor) {
            if (!isFillable(neighbor, referencePoint, self.step)) return;

            if (isPartial && _.sample([true, false])) {
                self.seeds.add(referencePoint);
            } else {
                self.seeds.add(neighbor);
                onFill(neighbor, referencePoint, self.step);
            }
        });
    };
};