import _ from 'lodash'

import { Grid } from './grid'
import { Point } from './point'
import { Random } from './base'


const EMPTY = null


export const MidpointDisplacement = (source, target, roughness, callback = _.noop) => {
    const deltaX = Math.abs(source.x - target.x)
    const deltaY = Math.abs(source.y - target.y)
    const fixedAxis = deltaX > deltaY ? 'x' : 'y'
    const displacedAxis = deltaX > deltaY ? 'y' : 'x'
    const size = Math.abs(target[fixedAxis] - source[fixedAxis])
    let displacement = roughness * (size / 2)
    let points = []

    const buildPoint = (p1, p2) => {
        if (Math.abs(p2[fixedAxis] - p1[fixedAxis]) <= 1)
            return
        const displacedValue = (p1[displacedAxis] + p2[displacedAxis]) / 2
        const variance = Random.int(-displacement, displacement)
        const point = new Point()

        point[fixedAxis] = Math.floor((p1[fixedAxis] + p2[fixedAxis]) / 2)
        point[displacedAxis] = Math.round(displacedValue + variance)
        return point
    }

    const midpoints = (p1, p2, size) => {
        let points = []
        let point = buildPoint(p1, p2)
        if (!point)
            return points
        displacement = roughness * size
        points = points.concat(midpoints(p1, point, size / 2))
        addPoint(point)
        points = points.concat(midpoints(point, p2, size / 2))
        return points
    }

    const addPoint = (point) => {
        points.push(point)
        callback(point)
    }

    addPoint(source)
    points = points.concat(midpoints(source, target, size / 2))
    addPoint(target)

    return points
}


export class HeightMap {
    constructor(size, roughness, values, mask) {
        this.scale  = roughness * (size - 1)
        this.grid   = new Grid(size, size, EMPTY)
        this.max    = -Infinity
        this.min    = Infinity
        this.values = values || []
        this.size   = size
        this.mask   = mask
        this._build()
    }

    _build() {
        this._setSeedPoints()
        for (let midSize = this.size - 1; midSize / 2 >= 1; midSize /= 2) {
            this._squareStep(midSize)
            this._diamondStep(midSize)
            this.scale /= 2
        }
    }

    _setSeedPoints() {
        const maxIndex = this.size - 1
        this._set(new Point(0, 0), this._getVariation())
        this._set(new Point(maxIndex, 0), this._getVariation())
        this._set(new Point(0, maxIndex), this._getVariation())
        this._set(new Point(maxIndex, maxIndex), this._getVariation())
    }

    _squareStep(midSize) {
        const half = midSize / 2
        const size = this.size - 1
        for (let y = half; y < size; y += midSize) {
            for (let x = half; x < size; x += midSize) {
                this._square(new Point(x, y), half)
            }
        }
    }

    _diamondStep(midSize) {
        const half = midSize / 2
        const size = this.size - 1
        for (let y = 0; y <= size; y += half) {
            for (let x = (y + half) % midSize; x <= size; x += midSize) {
                this._diamond(new Point(x, y), half)
            }
        }
    }

    _square(point, midSize) {
        const {x, y} = point
        const average = this._averagePoints([
            [x + midSize, y - midSize],   // upper right
            [x + midSize, y + midSize],   // lower right
            [x - midSize, y - midSize],   // upper left
            [x - midSize, y + midSize],   // lower left
        ])
        this._set(point, average + this._getVariation())
    }

    _diamond(point, midSize) {
        const {x, y} = point
        const average = this._averagePoints([
            [x, y - midSize],   // top
            [x, y + midSize],   // bottom
            [x + midSize, y],   // right
            [x - midSize, y],   // left
        ])
        this._set(point, average + this._getVariation())
    }

    _getVariation() {
        return Random.int(-this.scale, this.scale)
    }

    _averagePoints(points) {
        const getValue = ([ x, y ]) => this.grid.get(new Point(x, y))
        const values = points.map(getValue).filter(_.isNumber)
        return _.sum(values) / values.length
    }

    _set(point, value) {
        const size = this.size
        const height = _.toInteger(_.clamp(value, -size, size))
        this.grid.set(point, height)
        this._updateMinMax(height)
    }

    _updateMinMax(height) {
        if (height > this.max) this.max = height
        if (height < this.min) this.min = height
    }

    get(point) {
        let value = this.grid.get(point)
        if (this.mask) {
            const mask = this.mask.get(point)
            value -= (value * mask) / 100
            value = _.clamp(value, this.min, this.max)
        }
        return this.values.length ? this._normalize(value) : value
    }

    _normalize(height) {
        const newRange = this.values.length - 1
        const oldRange = this.max - this.min
        const index = (height - this.min) / oldRange * newRange
        return this.values[Math.floor(index)]
    }
}


export class TileableHeightMap extends HeightMap {
    _setSeedPoints() {
        const maxIndex = this.size - 1
        const value = this._getVariation()
        this._set(new Point(0, 0), value)
        this._set(new Point(maxIndex, 0), value)
        this._set(new Point(0, maxIndex), value)
        this._set(new Point(maxIndex, maxIndex), value)
    }

    _set(point, value) {
        if (this.grid.get(point) != EMPTY) return
        if (! this._isCorner(point)) {
            let oppositeEdge = this._getOpposite(point)
            super._set(oppositeEdge, value)
        }
        super._set(point, value)
    }

    _isCorner(point) {
        let { x, y } = point
        let size = this.size - 1
        const topLeft = x == 0 && y == 0
        const bottomRight = x == size && y == size
        const topRight = x == size && y == 0
        const bottomLeft = x == 0 && y == size
        return topLeft || bottomRight || topRight || bottomLeft
    }

    _getOpposite(point) {
        let { x, y } = point
        if (point.x === 0) x = this.size - 1
        if (point.y === 0) y = this.size - 1
        return new Point(x, y)
    }
}
