import _ from 'lodash'

import { Grid } from './grid'
import { Point } from './point'
import { Random } from './base'

const EMPTY = 0


export class HeightMap {
    constructor(size, roughness) {
        this._scale   = roughness * (size - 1)
        this.grid     = new Grid(size, size, EMPTY)
        this.size     = size
        this.maxValue = -Infinity
        this.minValue = Infinity
        this._buildGrid()
    }

    _buildGrid(){
        this._setSeedPoints()
        for(let midSize = this.size - 1; midSize / 2 >= 1; midSize /= 2){
            this._squareStep(midSize)
            this._diamondStep(midSize)
            this._scale /= 2
        }
    }

    _setSeedPoints() {
        let maxIndex = this.size - 1
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
        return Random.int(-this._scale, this._scale)
    }

    _averagePoints(points) {
        const getValue = ([ x, y ]) => this.grid.get(new Point(x, y))
        const values = points.map(getValue).filter(_.isNumber)
        return _.sum(values) / values.length
    }

    _set(point, value) {
        const height = _.clamp(value, -this.size, this.size)
        this.grid.set(point, height)
        this._updateMetrics(height)
    }

    _updateMetrics(height) {
        if (height > this.maxValue) this.maxValue = height
        if (height < this.minValue) this.minValue = height
    }

    get(point) {
        return this.grid.get(point)
    }
}


export class TileableHeightMap extends HeightMap {
    _isEdge(point) {
        let isTopLeft = point.x === 0 || point.y === 0,
            isBottomRight = point.x === this.size - 1 ||
                point.y === this.size - 1
        return isTopLeft || isBottomRight
    }

    _oppositeEdge(point) {
        let {x, y} = point
        if (!this._isEdge(point)) {
            throw new RangeError("Point not in edge")
        }
        if (point.x === 0) { x = this.size - 1 }
        if (point.x === this.size - 1) { x = 0 }
        if (point.y === 0) { y = this.size - 1 }
        if (point.y === this.size - 1) { y = 0 }
        return new Point(x, y)
    }

    _set(point, value) {
        if (this.get(point) != EMPTY) return
        if (this._isEdge(point)) {
            let oppositeEdge = this._oppositeEdge(point)
            super._set(oppositeEdge, value)
        }
        super._set(point, value)
    }
}


export const MidpointDisplacement = (source, target, roughness, callback=_.noop) => {
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
