
class Grid {
    constructor(width, height, defaultValue) {
        this.width = width
        this.height = height
        this.matrix = []

        for(var y = 0; y < this.height; y++) {
            this.matrix.push([])
            for(var x = 0; x < this.width; x++){
                this.matrix[y].push(defaultValue)
            }
        }
    }

    get (point) {
        let p = this.wrap(point)
        return this.matrix[p.y][p.x]
    }

    set (point, value) {
        let p = this.wrap(point)
        this.matrix[p.y][p.x] = value
    }

    wrap (point) {
        let x = point.x,
            y = point.y
        if (x >= this.width){ x %= this.width }
        if (y >= this.height){ y %= this.height }
        if (x < 0){ x = this.width - 1 - Math.abs(x+1) % this.width }
        if (y < 0){ y = this.height - 1 - Math.abs(y+1) % this.height }
        return new Point(x, y);
    }

    forEach (callback) {
        for(var y = 0; y < this.height; y++){
            for(var x = 0; x < this.width; x++){
                var point = new Point(x, y),
                    value = this.get(point)
                callback(value, point)
            }
        }
    }

    isEdge (point) {
        var isTopLeft = point.x === 0 || point.y === 0,
            isBottomRight = point.x === this.width - 1 ||
                            point.y === this.height - 1
        return isTopLeft || isBottomRight
    }

    oppositeEdge (point) {
        var x = point.x,
            y = point.y
        if (! this.isEdge(point)) {
            throw new RangeError("Point not in edge")
        }
        if (point.x === 0) { x = this.width - 1 }
        if (point.x === this.width - 1) { x = 0 }
        if (point.y === 0) { y = this.height - 1 }
        if (point.y === this.height - 1) { y = 0 }
        return new Point(x, y)
    }
}


class GridPointDistribution {
    constructor (grid, numPoints = 1) {
        this.grid = grid
        this.numPoints = numPoints
        this.chosenPoints = new HashMap()
    }

    createRandomPoint () {
        let x = _.random(this.grid.width-1),
            y = _.random(this.grid.height-1)
        return new Point(x, y)
    }

    each (callback) {
        let count = 0
        while(count < this.numPoints) {
            let point = this.createRandomPoint()
            if (this.chosenPoints.has(point))
                continue
            this.chosenPoints.add(point)
            callback(point, count++)
        }
    }
}


class GridFill {
    constructor (point, onFill, isFillable) {
        this.onFill = _.defaultTo(onFill, _.noop)
        this.isFillable = _.defaultTo(isFillable, _.stubTrue)
        this.step = 0
        this.seeds = new HashMap()
        this.startPoint = point

        this.seeds.add(point)
    }

    isComplete (times) {
        let noSeeds = this.seeds.size() === 0,
            timesEnded = _.isNumber(times) && times <= 0
        return noSeeds || timesEnded
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
        this.seeds = new HashMap()
        currentSeeds.each(point => {
            this.growNeighbors(point, isPartial)
        })
        this.step++
        if (times > 1) {
            this._grow(times - 1, isPartial)
        }
    }

    growNeighbors (referencePoint, isPartial) {
        new PointNeighborhood(referencePoint)
        .adjacent((neighbor, direction) => {
            if (!this.isFillable(neighbor, referencePoint, direction, this.step))
                return

            if (isPartial && _.sample([true, false])) {
                this.seeds.add(referencePoint)
            } else {
                this.seeds.add(neighbor)
                this.onFill(neighbor, referencePoint, this.step)
            }
        })
    }
}



class MultiGridFill {
    constructor(size, totalPoints) {
        this.size = size
        this.growthRate = 20
        this.grid = new Grid(size, size)
        this.gridFillMap = {}
        this._constructPoints(totalPoints)
    }

    _constructPoints(totalPoints) {
        const buildGridFill = (startPoint, value) => {
            const onFill = this._constructOnFill(value)
            const isFillable = this._constructIsFillable(value, startPoint)
            this.gridFillMap[plateId] = new GridFill(startPoint, onFill, isFillable)
        }
        new GridPointDistribution(this.grid, totalPoints)
            .each(buildGridFill)
    }

    _constructOnFill(value) {
        return point => this.grid.set(point, value)
    }

    _constructIsFillable(value, startPoint) {
        let originalValue = this.grid.get(startPoint)
        const callback = (neighbor, point) => {
            var neighborValue = this.grid.get(neighbor)
            if (isEdge(neighborValue, originalValue)) {
                return false
            }
            return neighborValue === originalValue
        }
        const isEdge = (neighborValue, originalValue) => {
            return neighborValue != value && neighborValue != originalValue
        }
        return callback
    }

    /* Grow the grid fills until all them complete. */
    build() {
        let fillableKeys = _.keys(this.gridFillMap)

        while (fillableKeys.length > 0) {
            _.each(fillableKeys, key => {
                if (_.sample([true, false]))
                    return
                let gridFill = this.gridFillMap[key]
                if (gridFill.isComplete()) {
                    delete this.gridFillMap[key]
                    return
                }
                gridFill.growPartial(this.growthRate)
            })
            fillableKeys = _.keys(this.gridFillMap)
        }
    }
}
