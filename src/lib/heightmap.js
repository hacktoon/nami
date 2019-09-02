import _ from 'lodash'

import { Grid } from './grid'
import { Point } from './point'
import { Random } from './base'
import { ColorGradient } from './color'
import { ValueDistributionMap } from './indexing'

const EMPTY = 0


class BaseHeightMap {
    constructor(size) {
        this.grid      = new Grid(size, size, EMPTY)
        this.size      = size
        this.maxValue  = -Infinity
        this.minValue  = Infinity

        this._init()
        this._buildGrid(size)
    }

    _init() {
        const maxIndex = this.size - 1
        this._set(0, 0, Random.float())
        this._set(maxIndex, 0, Random.float())
        this._set(0, maxIndex, Random.float())
        this._set(maxIndex, maxIndex, Random.float())
    }

    _buildGrid(size) {
        for (let midSize = size - 1; midSize / 2 >= 1; midSize /= 2) {
            const half = midSize / 2
            this._squareStep(midSize, half)
            this._diamondStep(midSize, half)
        }
    }

    _squareStep(midSize, half) {
        for (let y = half; y < this.size - 1; y += midSize) {
            for (let x = half; x < this.size - 1; x += midSize) {
                this._getSquareValue(x, y, half)
            }
        }
    }

    _diamondStep(midSize, half) {
        for (let y = 0; y <= this.size - 1; y += half) {
            for (let x = (y + half) % midSize; x <= this.size - 1; x += midSize) {
                this._getDiamondValue(x, y, half)
            }
        }
    }

    _getSquareValue(x, y, size) {
        const variation = Random.floatRange(-size, size)
        const height = this._averagePoints([
            [x - size, y - size],   // upper left
            [x + size, y - size],   // upper right
            [x + size, y + size],   // lower right
            [x - size, y + size]    // lower left
        ])
        this._set(x, y, height + variation)
    }

    _getDiamondValue(x, y, size) {
        const variation = Random.floatRange(-size, size)
        const height = this._averagePoints([
            [x, y - size],          // top
            [x, y + size],          // bottom
            [x + size, y],          // right
            [x - size, y]           // left
        ])
        this._set(x, y, height + variation)
    }

    _averagePoints(points) {
        // TODO : wrap option
        const getValue = ([ x, y ]) => this.grid.get(new Point(x, y))
        const values = points.map(getValue).filter(_.isNumber)
        return _.sum(values) / values.length
    }

    _set(x, y, height) {
        this.grid.set(new Point(x, y), height)
        if (height > this.maxValue) this.maxValue = height
        if (height < this.minValue) this.minValue = height
    }

    get(point) {
        return this.grid.get(point)
    }
}


//export class MaskHeightMap extends BaseHeightMap {}

//export class IterativeHeightMap extends BaseHeightMap {}

export class HeightMap extends BaseHeightMap {
    constructor(size) {
        super(size)
        this.values = [
            ...ColorGradient('000022', '000080', 28),
            ...ColorGradient('729b00', '41c11b', 8),
            ...ColorGradient('41c11b', '246c0f', 28),
            ...ColorGradient('555555', 'FFFFFF', 8)
        ]
    }

    getColor(point) {
        const height = this.get(point)
        const index = this._normalizeIndex(height, this.values)
        return this.values[index]
    }

    _normalizeIndex(value, valueList) {
        const newRange = valueList.length
        const oldRange = this.maxValue - this.minValue
        const index = (value - this.minValue) / oldRange * newRange
        return Math.floor(index)
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
