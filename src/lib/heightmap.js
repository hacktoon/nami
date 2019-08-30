import _ from 'lodash'

import { Grid } from './grid'
import { Point } from './point'
import { Random } from './base'
import { ColorGradient } from './color'

const Simplex = require('perlin-simplex')

const EMPTY = 0

window.ColorGradient = ColorGradient
window.Simplex = Simplex


export class HeightMap {
    constructor(size, roughness, callback = _.noop) {
        this.grid = new Grid(size, size, EMPTY)
        this.callback = callback
        this.size = size
        this.maxHeight = 0
        this.maxVariance = 0

        this._buildGrid(size, roughness)
        log('max size: ', this.maxHeight)
        this.colorMap = ColorGradient('444', 'FFF', 200)
    }

    _buildGrid(size, roughness) {
        this.setInitialPoints()

        for(let midSize = size - 1; midSize / 2 >= 1; midSize /= 2) {
            let half = midSize / 2
            let scale = Math.round(roughness * half)

            for(let y = half; y < size - 1; y += midSize) {
                for (let x = half; x < size - 1; x += midSize) {
                    let variance = Random.int(-scale, scale)
                    if (variance > this.maxVariance) {
                        log('scale: ', scale)
                        this.maxVariance = variance
                    }
                    this.square(new Point(x, y), half, variance)
                }
            }

            for(let y = 0; y <= size - 1; y += half) {
                for (let x = (y + half) % midSize; x <= size - 1; x += midSize) {
                    let variance = Random.int(-scale, scale)
                    if (variance > this.maxVariance) {

                        this.maxVariance = variance
                    }
                    this.diamond(new Point(x, y), half, variance)
                }
            }
        }
        log('max variance: ', this.maxVariance)
    }

    get(point) {
        return this.grid.get(point)
    }

    getColor(point) {
        const height = this.get(point)
        return this.colorMap[height]
    }

    iter(callback) {
        this.grid.forEach(callback)
    }

    setInitialPoints () {
        let maxIndex = this.size - 1
        let rand = () => Random.int(0, this.size)
        this.set(new Point(0, 0), rand())
        this.set(new Point(maxIndex, 0), rand())
        this.set(new Point(0, maxIndex), rand())
        this.set(new Point(maxIndex, maxIndex), rand())
    }

    diamond (point, midSize, offset) {
        let x = point.x,
            y = point.y,
            average = this.averagePoints([
                new Point(x, y - midSize),      // top
                new Point(x + midSize, y),      // right
                new Point(x, y + midSize),      // bottom
                new Point(x - midSize, y)       // left
            ])
        this.set(point, average + offset)
    }

    square (point, midSize, offset) {
        let x = point.x,
            y = point.y,
            average = this.averagePoints([
                new Point(x - midSize, y - midSize),   // upper left
                new Point(x + midSize, y - midSize),   // upper right
                new Point(x + midSize, y + midSize),   // lower right
                new Point(x - midSize, y + midSize)    // lower left
            ])
        this.set(point, average + offset)
    }

    set(point, height) {
        if (height > this.maxHeight) {
            this.maxHeight = height
        }
        height = Math.max(0, height)
        // if (this.grid.isEdge(point)) {
        //     let oppositeEdge = this.grid.oppositeEdge(point)
        //     this.grid.set(oppositeEdge, height)
        // }
        // limit on vertical
        // if (point.y < 30 || point.y > 226) {
        //     height = 0
        // }
        // flat earth map filter
        // if (Point.euclidianDistance(point, new Point(this.size / 2, this.size/2)) > 127) {
        //     height = 0
        // }
        this.grid.set(point, height)
        this.callback(height, point)
    }

    averagePoints(points) {
        let values = points.map(pt => this.grid.get(pt))
        return Math.floor(_.sum(values) / values.length)
    }

    meanPoints(points) {
        let values = points.map(pt => this.grid.get(pt))
        return Math.floor(_.sum(values) / values.length)
        values.sort((a, b) => a - b)
        if (values.length % 2 == 0) {
            let midIndex = (values.length) / 2
            let first = values[midIndex - 1]
            let second = values[midIndex]
            return Math.floor((first + second) / 2)
        } else {
            let index = Math.floor(values.length / 2)
            return values[index]
        }
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
