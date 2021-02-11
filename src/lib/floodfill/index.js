

export class FloodFill {
    constructor(origin, params) {
        this.origin = origin
        this.seeds = [origin]
        this.setValue = params.setValue
        this.isEmpty = params.isEmpty

        this.setValue(this.origin)
        this.area = 1
    }

    canGrow() {
        return this.seeds.length > 0
    }

    grow() {
        this.seeds = this.growLayer()
        return this.seeds
    }

    growLayer(seeds=this.seeds) {
        let newSeeds = []
        for(let i = 0; i < seeds.length; i++) {
            const filledNeighbors = this.fillNeighbors(seeds[i])
            newSeeds.push(...filledNeighbors)
        }
        return newSeeds
    }

    fillNeighbors(point) {
        const filledNeighbors = []
        const emptyNeighbors = point.adjacents(p => this.isEmpty(p))
        for(let i = 0; i < emptyNeighbors.length; i++) {
            const neighbor = emptyNeighbors[i]
            this.setValue(neighbor)
            this.area += 1
            filledNeighbors.push(neighbor)
        }
        return filledNeighbors
    }
}


export class ScanlineFill {
    constructor(matrix, startPoint, onFill, isFillable) {
        this.startPoint = startPoint
        this.matrix = matrix
        this.rangeQueue = []
        this.onFill = onFill
        this.isFillable = isFillable

        this.createRange(startPoint)
    }

    createRange(point) {
        this.rangeQueue.push({
            point: this.findRangeStart(point),
            canCheckAbove: true,
            canCheckBelow: true
        })
    }

    findRangeStart(originPoint) {
        let currentPoint = originPoint
        let nextPoint = this.matrix.wrap(currentPoint.atWest())
        while (this.isFillable(nextPoint) && nextPoint.x != originPoint.x) {
            currentPoint = nextPoint
            nextPoint = this.matrix.wrap(nextPoint.atWest())
        }
        return currentPoint
    }

    fill() {
        while (!this.isComplete) {
            this.stepFill()
        }
    }

    get isComplete() {
        return this.rangeQueue.length === 0
    }

    stepFill() {
        let ranges = this.rangeQueue

        this.rangeQueue = []
        while (ranges.length) {
            this.fillRange(ranges.pop())
        }
    }

    fillRange(range) {
        let point = range.point

        while (this.isFillable(point)) {
            this.onFill(point)
            this.detectRangeAbove(point.atNorth(), range)
            this.detectRangeBelow(point.atSouth(), range)
            point = this.matrix.wrap(point.atEast())
        }
    }

    detectRangeAbove(referencePoint, referenceRange) {
        let pointAbove = this.matrix.wrap(referencePoint)
        if (this.isFillable(pointAbove)) {
            if (referenceRange.canCheckAbove) {
                this.createRange(pointAbove)
                referenceRange.canCheckAbove = false
            }
        } else {
            referenceRange.canCheckAbove = true
        }
    }

    detectRangeBelow(referencePoint, referenceRange) {
        let pointBelow = this.matrix.wrap(referencePoint)
        if (this.isFillable(pointBelow)) {
            if (referenceRange.canCheckBelow) {
                this.createRange(pointBelow)
                referenceRange.canCheckBelow = false
            }
        } else {
            referenceRange.canCheckBelow = true
        }
    }
}


export class ScanlineFill8 extends ScanlineFill {
    fillRange(range) {
        let point = range.point

        while (this.isFillable(point)) {
            this.onFill(point)
            this.detectRangeAbove(point.atNorthwest(), range)
            this.detectRangeAbove(point.atNorth(), range)
            this.detectRangeAbove(point.atNortheast(), range)
            this.detectRangeBelow(point.atSouthwest(), range)
            this.detectRangeBelow(point.atSouth(), range)
            this.detectRangeBelow(point.atSoutheast(), range)
            point = this.matrix.wrap(point.atEast())
        }
    }
}


export class MultiFill {
    constructor(origins, buildFill) {
        this.fills = origins.map((center, i) => buildFill(center,  i + 1))
        this.size = this.fills.length
        this.canGrow = true

        while(this.canGrow) {
            this.grow()
        }
    }

    forEach(callback) {
        this.fills.forEach(fill => callback(fill))
    }

    grow() {
        let totalFull = 0
        for(let i = 0; i < this.fills.length; i++) {
            const filled = this.fills[i].grow()
            if (filled.length === 0) totalFull++
        }
        if (totalFull === this.fills.length) {
            this.canGrow = false
        }
    }
}

