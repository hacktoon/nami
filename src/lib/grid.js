import _ from 'lodash'

import {Point} from './point'
import {HashMap} from './base'


export class Grid {
    constructor(width, height, defaultValue) {
        this.width = width
        this.height = height
        this.matrix = []

        for(let y = 0; y < this.height; y++) {
            this.matrix.push([])
            for(let x = 0; x < this.width; x++){
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


export class GridFill {
    constructor (size, point, onFill=_.noop, isFillable=_.stubTrue) {
        this.grid = new Grid(size, size)
        this.filledPoints = new HashMap()
        this.seeds = []
        this.isFillable = isFillable
        this.startPoint = point
        this.onFill = onFill
        this.step = 0

        this.fillPoint(point)
    }

    isComplete () {
        return this.seeds.length === 0
    }

    fill () {
        while (!this.isComplete()) {
            this.stepFill()
        }
    }

    stepFill (times=1) {
        if (this.isComplete())
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
            neighbor = this.grid.wrap(neighbor)
            if (this.filledPoints.has(neighbor))
                return
            if (!this.isFillable(neighbor, referencePoint, direction, this.step))
                return
            this.fillPoint(neighbor)
        })
    }

    fillPoint (point) {
        this.seeds.push(point)
        this.filledPoints.add(point)
        this.onFill(point, this.step)
    }
}
