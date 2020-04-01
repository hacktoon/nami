import { Random } from '/lib/random'
import { Point } from '/lib/point'


export class SmartFloodFill {
    constructor(onFill, isFillable) {
        this.isFillable = isFillable
        this.onFill = onFill
    }

    grow(seeds) {
        let newSeeds = []
        seeds.forEach(seed => {
            seed.OldAdjacentPoints(point => this.fillPoint(newSeeds, point))
        })
        return newSeeds
    }

    growRandom(seeds) {
        let newSeeds = this.grow(seeds)
        let extraSeeds = this.grow(newSeeds.filter(() => Random.chance(.2)))
        return newSeeds.concat(extraSeeds)
    }

    fillPoint(nextSeeds, point) {
        if (! this.isFillable(point)) return
        this.onFill(point)
        nextSeeds.push(point)
    }
}


export class FloodFill {
    constructor(grid, startPoint, onFill, isFillable) {
        this.grid = grid
        this.seeds = []
        this.isFillable = isFillable
        this.startPoint = startPoint
        this.onFill = onFill
        this.step = 0

        this.fillPoint(startPoint)
    }

    get isComplete() {
        return this.seeds.length === 0
    }

    fill() {
        while (!this.isComplete) {
            this.stepFill()
        }
    }

    stepFill(times = 1) {
        if (this.isComplete)
            return
        let currentSeeds = this.seeds
        this.seeds = []
        currentSeeds.forEach(point => {
            this.fillNeighborPoints(point)
        })
        this.step++
        if (times > 1) {
            this.stepFill(times - 1)
        }
    }

    fillNeighborPoints(referencePoint) {
        referencePoint.OldAdjacentPoints(neighbor => {
            let point = this.grid.wrap(neighbor)
            if (this.isFillable(point, referencePoint, this.step))
                this.fillPoint(point)
        })
    }

    fillPoint(point) {
        this.seeds.push(point)
        this.onFill(point, this.step)
    }
}


export class ScanlineFill {
    constructor(grid, startPoint, onFill, isFillable) {
        this.startPoint = startPoint
        this.grid = grid
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
        let nextPoint = this.grid.wrap(Point.atWest(currentPoint))
        while (this.isFillable(nextPoint) && nextPoint.x != originPoint.x) {
            currentPoint = nextPoint
            nextPoint = this.grid.wrap(Point.atWest(nextPoint))
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
            this.detectRangeAbove(Point.atNorth(point), range)
            this.detectRangeBelow(Point.atSouth(point), range)
            point = this.grid.wrap(Point.atEast(point))
        }
    }

    detectRangeAbove(referencePoint, referenceRange) {
        let pointAbove = this.grid.wrap(referencePoint)
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
        let pointBelow = this.grid.wrap(referencePoint)
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
            this.detectRangeAbove(Point.atNorthwest(point), range)
            this.detectRangeAbove(Point.atNorth(point), range)
            this.detectRangeAbove(Point.atNortheast(point), range)
            this.detectRangeBelow(Point.atSouthwest(point), range)
            this.detectRangeBelow(Point.atSouth(point), range)
            this.detectRangeBelow(Point.atSoutheast(point), range)
            point = this.grid.wrap(Point.atEast(point))
        }
    }
}
