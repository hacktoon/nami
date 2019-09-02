import _ from 'lodash'

import { Grid } from './grid'
import { Point } from './point'
import { Random } from './base'
import { ColorGradient } from './color'
import { ValueDistributionMap } from './indexing'

const EMPTY = 0

window.ColorGradient = ColorGradient


class BaseHeightMap {
    constructor(size, roughness, callback) {
        this.grid = new Grid(size, size, EMPTY)
        this.roughness = roughness
        this.callback = callback
        this.size     = size
        this.maxValue = 0
        this.minValue = 0

        this._init()
        this._buildGrid(size)
    }

    _init() {
        const maxIndex = this.size - 1
        const _rand = () => Random.float()
        this._set(new Point(0, 0), _rand())
        this._set(new Point(maxIndex, 0), _rand())
        this._set(new Point(0, maxIndex), _rand())
        this._set(new Point(maxIndex, maxIndex), _rand())
    }

    _buildGrid(size) {
        for (let midSize = size - 1; midSize / 2 >= 1; midSize /= 2) {
            let half = midSize / 2
            for (let y = half; y < size - 1; y += midSize) {
                for (let x = half; x < size - 1; x += midSize) {
                    this.square(x, y, half)
                }
            }
            for (let y = 0; y <= size - 1; y += half) {
                for (let x = (y + half) % midSize; x <= size - 1; x += midSize) {
                    this.diamond(x, y, half)
                }
            }
        }
    }

    square(x, y, size) {
        const variation = Random.floatRange(-size, size)
        const height = this._averagePoints([
            new Point(x - size, y - size),   // upper left
            new Point(x + size, y - size),   // upper right
            new Point(x + size, y + size),   // lower right
            new Point(x - size, y + size)    // lower left
        ])
        this._set(new Point(x, y), height + variation)
    }

    diamond(x, y, size) {
        const variation = Random.floatRange(-size, size)
        const height = this._averagePoints([
            new Point(x, y - size),      // top
            new Point(x + size, y),      // right
            new Point(x, y + size),      // bottom
            new Point(x - size, y)       // left
        ])
        this._set(new Point(x, y), height + variation)
    }

    _averagePoints(points) {
        // TODO : wrap option
        const getValue = ({ x, y }) => this.grid.get(new Point(x, y))
        const values = points.map(getValue).filter(p=> p != undefined)
        return _.sum(values) / values.length
    }

    _set(point, height) {
        this.grid.set(point, height)
        this.callback(height, point)
        if (height > this.maxValue) this.maxValue = height
        if (height < this.minValue) this.minValue = height
    }

    get(point) {
        const height = this.grid.get(point)
        // normalize value to [0, 1] range
        return (height - this.minValue) / (this.maxValue - this.minValue)
    }
}


//export class MaskHeightMap extends BaseHeightMap {}

//export class IterativeHeightMap extends BaseHeightMap {}

export class HeightMap extends BaseHeightMap {
    constructor(size, roughness, callback = _.noop) {
        super(size, roughness, callback)
        let values = [
            ...ColorGradient('000022', '000080', 10),
            ...ColorGradient('729b00', '41c11b', 10),
            ...ColorGradient('41c11b', '246c0f', 10),
            ...ColorGradient('555555', 'FFFFFF', 10)
        ]
        this.map = new ValueDistributionMap(size, ColorGradient('000', 'FFF', roughness))
    }

    getColor(point) {
        const height = this.get(point)
        return this.map.get(Math.floor(height * (this.size - 1)))
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



class HeightColorMap {
    constructor(size, rates, colorGradient) {
        this.map = this._buildMap(table)
    }

    _buildMap() {

    }

    getColor(height) {

        return this.map[height]
    }
}
