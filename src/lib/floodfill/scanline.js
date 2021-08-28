import { Point } from '/lib/base/point'


export class ScanlineFill {
    constructor(startPoint, config) {
        this.startPoint = startPoint
        this.config = config
        this.rangeQueue = []
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
        let nextPoint = this.config.filterPoint(Point.atWest(currentPoint))
        while (this.config.canFill(nextPoint) && nextPoint.x != originPoint.x) {
            currentPoint = nextPoint
            nextPoint = this.config.filterPoint(Point.atWest(nextPoint))
        }
        return currentPoint
    }

    fill() {
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
        while (ranges.length) {
            this.fillRange(ranges.pop())
        }
    }

    fillRange(range) {
        let point = range.point

        while (this.config.canFill(point)) {
            this.config.onFill(point)
            this.detectRangeAbove(Point.atNorth(point), range)
            this.detectRangeBelow(Point.atSouth(point), range)
            point = this.config.filterPoint(Point.atEast(point))
        }
    }

    detectRangeAbove(referencePoint, referenceRange) {
        let pointAbove = this.config.filterPoint(referencePoint)
        if (this.config.canFill(pointAbove)) {
            if (referenceRange.canCheckAbove) {
                this.createRange(pointAbove)
                referenceRange.canCheckAbove = false
            }
        } else {
            referenceRange.canCheckAbove = true
        }
    }

    detectRangeBelow(referencePoint, referenceRange) {
        let pointBelow = this.config.filterPoint(referencePoint)
        if (this.config.canFill(pointBelow)) {
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

        while (this.config.canFill(point)) {
            this.onFill(point)
            this.detectRangeAbove(Point.atNorthwest(point), range)
            this.detectRangeAbove(Point.atNorth(point), range)
            this.detectRangeAbove(Point.atNortheast(point), range)
            this.detectRangeBelow(Point.atSouthwest(point), range)
            this.detectRangeBelow(Point.atSouth(point), range)
            this.detectRangeBelow(Point.atSoutheast(point), range)
            point = Point.atEast(point)
        }
    }
}

