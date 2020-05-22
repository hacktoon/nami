import { Random } from '/lib/random'


function h(pts) {
    return pts.map(p => p.hash)
}

export class OrganicFill {
    constructor(originPoint, params={}) {
        this.layer = 0
        this.seeds = [originPoint]
        this.setOrigin = params.setOrigin || function(){}
        this.setValue = params.setValue || function(){}
        this.setSeed = params.setSeed || function(){}
        this.unsetSeed = params.unsetSeed || function(){}
        this.setLayer = params.setLayer || function(){}
        this.setBorder = params.setBorder || function(){}
        this.isSeed = params.isSeed || (() => true)
        this.isEmpty = params.isEmpty || (() => false)
        this.isBlocked = params.isBlocked || (() => true)
        this.fillChance = params.fillChance || 1
        this.maxFills = params.maxFills || 1

        this.setOrigin(originPoint)
    }

    fill() {
        if (this.seeds.length == 0)
            return
        if (this.seeds.length < 6)
            console.log(h(this.seeds));

        const filled = this.fillPoints(this.seeds)
        const seeds = this.nextSeeds(filled)
        let times_remaining = Random.int(this.maxFills)
        // while(seeds.length && times_remaining--) {
        //     seeds.push(...this.nextRandomSeeds(seeds))
        //     console.log(seeds.length, times_remaining)
        // }
        this.layer++
        this.seeds = seeds
        return filled
    }

    fillPoints(points) {
        // return only filled points
        return points.filter(point => {
            if (! this.isEmpty(point))
                return false
            this.setValue(point)
            this.unsetSeed(point)
            this.setLayer(point, this.layer)
            return true
        })
    }

    fillRandomPoints(points) {
        return this.fillPoints(points.filter(() => {
            Random.chance(this.fillChance)
        }))
    }

    nextRandomSeeds(points) {
        return points.filter(() => Random.chance(this.fillChance))
    }

    nextSeeds(points) {
        let seeds = []
        points.forEach(point => {
            point.adjacents(seed => {
                if (this.isEmpty(seed) && !this.isSeed(seed)) {
                    this.setSeed(seed)
                    seeds.push(seed)
                }
                if (this.isBlocked(seed)) {
                    this.setBorder(point)
                }
            })
        })
        return seeds
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
        let nextPoint = this.grid.wrap(currentPoint.atWest())
        while (this.isFillable(nextPoint) && nextPoint.x != originPoint.x) {
            currentPoint = nextPoint
            nextPoint = this.grid.wrap(nextPoint.atWest())
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
            point = this.grid.wrap(point.atEast())
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
            this.detectRangeAbove(point.atNorthwest(), range)
            this.detectRangeAbove(point.atNorth(), range)
            this.detectRangeAbove(point.atNortheast(), range)
            this.detectRangeBelow(point.atSouthwest(), range)
            this.detectRangeBelow(point.atSouth(), range)
            this.detectRangeBelow(point.atSoutheast(), range)
            point = this.grid.wrap(point.atEast())
        }
    }
}
