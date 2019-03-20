import _ from 'lodash'

import { Point, PointNeighborhood } from './point'
import { HashMap } from './base'


export class Grid {
    constructor(width, height, defaultValue) {
        this.width = width
        this.height = height
        this.matrix = []

        for(let y = 0; y < this.height; y++) {
            this.matrix.push([])
            for(let x = 0; x < this.width; x++){
                let value = defaultValue
                if (_.isFunction(defaultValue)) {
                    value = defaultValue()
                }
                this.matrix[y].push(value)
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
        for(let y = 0; y < this.height; y++){
            for(let x = 0; x < this.width; x++){
                let point = new Point(x, y),
                    value = this.get(point)
                callback(value, point)
            }
        }
    }

    isEdge (point) {
        let isTopLeft = point.x === 0 || point.y === 0,
            isBottomRight = point.x === this.width - 1 ||
                            point.y === this.height - 1
        return isTopLeft || isBottomRight
    }

    oppositeEdge (point) {
        let x = point.x,
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


export class FloodFill {
    constructor (grid, startPoint, onFill=_.noop, isFillable=_.stubTrue) {
        this.grid = grid
        this.seeds = []
        this.isFillable = isFillable
        this.startPoint = startPoint
        this.onFill = onFill
        this.step = 0

        this.fillPoint(startPoint)
    }

    get isComplete () {
        return this.seeds.length === 0
    }

    fill () {
        while (!this.isComplete) {
            this.stepFill()
        }
    }

    stepFill (times=1) {
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

    fillNeighborPoints (referencePoint) {
        new PointNeighborhood(referencePoint)
        .adjacent((neighbor, direction) => {
            let point = this.grid.wrap(neighbor)
            if (this.isFillable(point, referencePoint, direction, this.step))
                this.fillPoint(point)
        })
    }

    fillPoint (point) {
        this.seeds.push(point)
        this.onFill(point, this.step)
    }
}


export class ScanlineFill {
    constructor (grid, startPoint, onFill=_.noop, isFillable=_.stubTrue) {
        this.startPoint = startPoint
        this.grid = grid
        this.rangeQueue = []
        this.onFill = onFill
        this.isFillable = isFillable

        this.createRange(startPoint)
    }

    createRange(point) {
        this.rangeQueue.push({
            point: this.detectRangeStart(point),
            canCheckAbove: true,
            canCheckBelow: true
        })
    }

    detectRangeStart(point) {
        let currentPoint = point
        let nextPoint = Point.atWest(currentPoint)
        while (this.isFillable(nextPoint) && nextPoint.x >= 0) {
            currentPoint = nextPoint
            nextPoint = Point.atWest(nextPoint)
        }
        return currentPoint
    }

    fill () {
        while (! this.isComplete) {
            this.stepFill()
        }
    }

    get isComplete() {
        return this.rangeQueue.length === 0
    }

    stepFill() {
        let ranges = this.rangeQueue

        this.rangeQueue = []
        while(ranges.length) {
            let range = ranges.pop()
            let point = range.point

            while(this.isFillable(point)) {
                this.fillPoint(point)
                this.detectRangeAbove(point, range)
                this.detectRangeBelow(point, range)
                point = Point.atEast(point)
            }
        }
    }

    detectRangeAbove(referencePoint, referenceRange) {
        let pointAbove = Point.atNorth(referencePoint)
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
        let pointBelow = Point.atSouth(referencePoint)
        if (this.isFillable(pointBelow)) {
            if (referenceRange.canCheckBelow) {
                this.createRange(pointBelow)
                referenceRange.canCheckBelow = false
            }
        } else {
            referenceRange.canCheckBelow = true
        }
    }

    fillPoint (point) {
        this.onFill(point)
    }
}
