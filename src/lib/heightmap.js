import _ from 'lodash'

import { Grid } from './grid'
import { Point } from './point'
import { Random } from './base'

const EMPTY = 0


export class BaseHeightMap {
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
        for (let y = half; y < this.size-1; y += midSize) {
            for (let x = half; x < this.size-1; x += midSize) {
                this._square(new Point(x, y), half)
            }
        }
    }

    _diamondStep(midSize) {
        const half = midSize / 2
        for (let y = 0; y <= this.size-1; y += half) {
            for (let x = (y + half) % midSize; x <= this.size-1; x += midSize) {
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
            [x - midSize, y + midSize]    // lower left
        ])
        this._set(point, average + this._getVariation())
    }

    _diamond(point, midSize) {
        const {x, y} = point
        const average = this._averagePoints([
            [x, y - midSize],      // top
            [x, y + midSize],      // bottom
            [x + midSize, y],      // right
            [x - midSize, y]       // left
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
        const height = _.clamp(value, 0, this.size-1)
        this._updateMetrics(height)
        this.grid.set(point, height)
    }

    _updateMetrics(height) {
        if (height > this.maxValue) this.maxValue = height
        if (height < this.minValue) this.minValue = height
    }

    get(point) {
        return this.grid.get(point)
    }
}


export class HeightMap extends BaseHeightMap {
    constructor(size, roughness) {
        super(size, roughness)
        this.values = initColors([
            ['#000023', 2],
            ['#000034', 3],
            ['#000045', 4],
            ['#000078', 4],
            ['#0a5816', 4],
            ['#31771a', 5],
            ['#6f942b', 3],
            ['#AAAAAA', 2],
            ['#CCCCCC', 5],
        ])
    }

    getColor(point) {
        const height = this.get(point)
        const index = this._normalizeIndex(height, this.values)
        return this.values[index]
    }

    _normalizeIndex(value, valueList) {
        const newRange = valueList.length - 1
        const oldRange = this.maxValue - this.minValue
        const index = (value - this.minValue) / oldRange * newRange
        return Math.floor(index)
    }
}

const initColors = (values) => {
    let arr = []
    for (let [val, count] of values) {
        arr = arr.concat(new Array(count).fill(val))
    }
    return arr
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
