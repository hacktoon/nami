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

        this.setInitialPoints()
        this._buildGrid(size, roughness)
    }

    setInitialPoints() {
        const maxIndex = this.size - 1
        const _rand = () => Random.float()
        this.set(new Point(0, 0), _rand())
        this.set(new Point(maxIndex, 0), _rand())
        this.set(new Point(0, maxIndex), _rand())
        this.set(new Point(maxIndex, maxIndex), _rand())
    }

    _buildGrid(size, roughness) {
        for (let midSize = size - 1; midSize / 2 >= 1; midSize /= 2) {
            let half = midSize / 2
            let scale = roughness * half

            for (let y = half; y < size - 1; y += midSize) {
                for (let x = half; x < size - 1; x += midSize) {
                    const offset = Random.floatRange(-scale, scale)
                    this.square(new Point(x, y), half, offset)
                }
            }

            for (let y = 0; y <= size - 1; y += half) {
                for (let x = (y + half) % midSize; x <= size - 1; x += midSize) {
                    const offset = Random.floatRange(-scale, scale)
                    this.diamond(new Point(x, y), half, offset)
                }
            }
        }
    }

    square(point, midSize, offset) {
        const {x, y} = point,
            average = this._averagePoints([
                new Point(x - midSize, y - midSize),   // upper left
                new Point(x + midSize, y - midSize),   // upper right
                new Point(x + midSize, y + midSize),   // lower right
                new Point(x - midSize, y + midSize)    // lower left
            ])
        this.set(point, average + offset)
    }

    diamond(point, midSize, offset) {
        const { x, y } = point,
            average = this._averagePoints([
                new Point(x, y - midSize),      // top
                new Point(x + midSize, y),      // right
                new Point(x, y + midSize),      // bottom
                new Point(x - midSize, y)       // left
            ])
        this.set(point, average + offset)
    }

    _averagePoints(points) {
        const values = points
            .map(pt => this.grid.get(pt))   // TODO : wrap option
            .filter(p=> p != undefined)
        return _.sum(values) / values.length
    }

    get(point) {
        const height = this.grid.get(point)
        // normalize value to [0, 1] range
        return (height - this.minValue) / (this.maxValue - this.minValue)
    }

    set(point, height) {
        // if (x > 10 && x < 246 && y > 10 && y < 246) {
        //     height = 256
        // }
        if (height > this.maxValue) this.maxValue = height
        if (height < this.minValue) this.minValue = height
        this.grid.set(point, height)
        this.callback(height, point)
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
        this.map = new ValueDistributionMap(size, values)
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
