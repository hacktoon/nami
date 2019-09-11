import _ from 'lodash'

import { Point } from './point'


export class Grid {
    constructor(width, height, defaultValue) {
        this.width = width
        this.height = height
        this.matrix = []

        for (let y = 0; y < this.height; y++) {
            this.matrix.push([])
            for (let x = 0; x < this.width; x++) {
                let value = defaultValue
                if (_.isFunction(defaultValue)) {
                    value = defaultValue(new Point(x, y))
                }
                this.matrix[y].push(value)
            }
        }
    }

    get(point) {
        let p = this.wrap(point)
        return this.matrix[p.y][p.x]
    }

    set(point, value) {
        let p = this.wrap(point)
        this.matrix[p.y][p.x] = value
    }

    wrap(point) {
        let {x, y} = point
        if (x >= this.width) { x %= this.width }
        if (y >= this.height) { y %= this.height }
        if (x < 0) { x = this.width - 1 - Math.abs(x + 1) % this.width }
        if (y < 0) { y = this.height - 1 - Math.abs(y + 1) % this.height }
        return new Point(x, y)
    }

    forEach(callback) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let point = new Point(x, y),
                    value = this.get(point)
                callback(value, point)
            }
        }
    }
}
