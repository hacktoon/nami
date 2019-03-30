import _ from 'lodash'

import { Grid } from './grid'
import { Point } from './point'
import { Random } from './base';


export class HeightMap {
    constructor(size, roughness, callback = _.noop) {
        this.grid = new Grid(size, size, 0)
        this.callback = callback
        this.size = size
        this.setInitialPoints()

        for(let midSize = size - 1; midSize/2 >= 1; midSize /= 2){
            let half = midSize / 2
            let scale = roughness * midSize

            for (let y = half; y < size-1; y += midSize) {
                for (let x = half; x < size-1; x += midSize) {
                    let variance = Random.int(-scale, scale)
                    let point = new Point(x, y)
                    this.square(point, half, variance)
                }
            }

            for (let y = 0; y <= size-1; y += half) {
                for (let x = (y + half) % midSize; x <= size-1; x += midSize) {
                    let variance = Random.int(-scale, scale)
                    let point = new Point(x, y)
                    this.diamond(point, half, variance)
                }
            }
        }
    }

    setInitialPoints () {
        let maxIndex = this.size - 1
        let rand = () => Random.int(0, this.size)
        this.setPoint(new Point(0, 0), rand())
        this.setPoint(new Point(maxIndex, 0), rand())
        this.setPoint(new Point(0, maxIndex), rand())
        this.setPoint(new Point(maxIndex, maxIndex), rand())
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
        this.setPoint(point, average + offset)
    }

    square (point, midSize, offset) {
        var x = point.x,
            y = point.y,
            average = this.averagePoints([
                new Point(x - midSize, y - midSize),   // upper left
                new Point(x + midSize, y - midSize),   // upper right
                new Point(x + midSize, y + midSize),   // lower right
                new Point(x - midSize, y + midSize)    // lower left
            ]);
        this.setPoint(point, average + offset)
    };

    setPoint (point, height) {
        height = _.clamp(height, 0, this.size)
        if (this.grid.isEdge(point)) {
            let oppositeEdge = this.grid.oppositeEdge(point)
            this.grid.set(oppositeEdge, height)
        }
        this.grid.set(point, height)
        this.callback(point, height)
    }

    averagePoints (points) {
        let values = points.map(pt => this.grid.get(pt))
        values.sort((a, b) => a - b)
        if (values.length % 2 == 0) {
            let midIndex = (values.length) / 2
            let first = values[midIndex - 1]
            let second = values[midIndex]
            return Math.round((first + second) / 2)
        } else {
            let index = Math.floor(values.length / 2)
            return values[index]
        }
    }
}


export function MidpointDisplacement(p1, p2, maxSize, roughness, callback) {
    var points = Array(size),
        size = maxSize - 1,
        displacement = roughness * (size / 2)

    var buildPoint = function (p1, p2) {
        if (p2.x - p1.x <= 1) return
        var x = Math.floor((p1.x + p2.x) / 2),
            y = (p1.y + p2.y) / 2 + Random.int(-displacement, displacement)
        y = _.clamp(Math.round(y), 0, maxSize - 1)
        return new Point(x, y)
    }

    var midpoint = function (p1, p2, size) {
        var point = buildPoint(p1, p2)
        if (!point) return
        points[point.x] = point
        callback(point)
        displacement = roughness * size
        midpoint(p1, point, size / 2)
        midpoint(point, p2, size / 2)
    }

    points[p1.x] = p1
    callback(p1)
    points[p2.x] = p2
    callback(p2)

    midpoint(p1, p2, size / 2)
    return points
};
