import { Point } from '/src/lib/point'


export class ScanlineFill {
    #rangeQueue = []

    #createRange(point) {
        this.#rangeQueue.push({
            point: this.#findRangeStart(point),
            canCheckAbove: true,
            canCheckBelow: true
        })
    }

    #findRangeStart(origin) {
        console.log(`#findRangeStart(${origin})`);
        let currentPoint = origin
        let nextPoint = this.config.wrapPoint(Point.atWest(currentPoint))
        while (this.canFill(nextPoint) && nextPoint[0] != origin[0]) {
            currentPoint = nextPoint
            nextPoint = this.config.wrapPoint(Point.atWest(nextPoint))
        }
        return currentPoint
    }

    canFill(point) {
        const wrappedPoint = this.config.wrapPoint(point)
        return this.config.canFill(wrappedPoint)
    }

    onFill(point) {
        const wrappedPoint = this.config.wrapPoint(point)
        return this.config.onFill(wrappedPoint)
    }

    #stepFill() {
        let ranges = this.#rangeQueue
        this.#rangeQueue = []
        while (ranges.length) {
            this.fillRange(ranges.pop())
        }
    }

    fillRange(range) {
        let point = range.point

        while (this.canFill(point)) {
            this.onFill(point)
            this.detectRangeAbove(Point.atNorth(point), range)
            this.detectRangeBelow(Point.atSouth(point), range)
            point = this.config.wrapPoint(Point.atEast(point))
        }
    }

    detectRangeAbove(referencePoint, referenceRange) {
        let pointAbove = this.config.wrapPoint(referencePoint)
        if (this.canFill(pointAbove)) {
            if (referenceRange.canCheckAbove) {
                this.#createRange(pointAbove)
                referenceRange.canCheckAbove = false
            }
        } else {
            referenceRange.canCheckAbove = true
        }
    }

    detectRangeBelow(referencePoint, referenceRange) {
        let pointBelow = this.config.wrapPoint(referencePoint)
        if (this.canFill(pointBelow)) {
            if (referenceRange.canCheckBelow) {
                this.#createRange(pointBelow)
                referenceRange.canCheckBelow = false
            }
        } else {
            referenceRange.canCheckBelow = true
        }
    }

    constructor(startPoint, config) {
        this.startPoint = startPoint
        this.config = config
        this.#createRange(startPoint)

    }

    fill() {
        while (! this.isComplete) {
            this.#stepFill()
        }
    }

    get isComplete() {
        return this.#rangeQueue.length === 0
    }
}


export class ScanlineFill8 extends ScanlineFill {
    fillRange(range) {
        let point = range.point

        while (this.canFill(point)) {
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

