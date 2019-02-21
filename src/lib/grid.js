
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
        return new Point(x, y);
    }

    forEach (callback) {
        for(var y = 0; y < this.height; y++){
            for(var x = 0; x < this.width; x++){
                var point = new Point(x, y),
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
        return new Point(x, y);
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
        return new Point(x, y);
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


class GridFill {
    constructor (point, onFill, isFillable) {
        this.onFill = _.defaultTo(onFill, _.noop);
        this.isFillable = _.defaultTo(isFillable, _.stubTrue);
        this.step = 0;
        this.seeds = new PointMap(point);
        this.startPoint = point;
    }

    isComplete (times) {
        let noSeeds = this.seeds.size() === 0,
            timesEnded = _.isNumber(times) && times <= 0;
        return noSeeds || timesEnded;
    }

    fill () {
        while (!this.isComplete()) {
            this.grow()
        }
    }

    grow (times) {
        this._grow(times, false)
    }

    growPartial (times) {
        this._grow(times, true)
    }

    _grow (times, isPartial) {
        times = _.defaultTo(times, 1)

        if (this.isComplete(times)) return

        let currentSeeds = this.seeds
        this.seeds = new PointMap()
        currentSeeds.each(point => {
            this.growNeighbors(point, isPartial)
        })
        if (times > 1) {
            this._grow(times - 1, isPartial)
        }
        this.step++;
    }

    growNeighbors (referencePoint, isPartial) {
        new PointNeighborhood(referencePoint)
        .adjacent(neighbor => {
            if (!this.isFillable(neighbor, referencePoint, this.step)) return;

            if (isPartial && _.sample([true, false])) {
                this.seeds.add(referencePoint);
            } else {
                this.seeds.add(neighbor);
                this.onFill(neighbor, referencePoint, this.step);
            }
        });
    }
};