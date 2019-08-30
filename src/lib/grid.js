import _ from 'lodash'

import { Point } from './point'


export class Grid {
    constructor(width, height, defaultValue) {
        this.width = width
        this.height = height
        this.matrix = []

        for(let y = 0; y < this.height; y++) {
            this.matrix.push([])
            for(let x = 0; x < this.width; x++){
                let value = defaultValue
                if (_.isFunction(defaultValue)) {
                    value = defaultValue(new Point(x, y))
                }
                this.matrix[y].push(value)
            }
        }
    }

    get (p) {
        if (this.isValid(p))
            return this.matrix[p.y][p.x]
    }

    set (p, value) {
        if (this.isValid(p))
            this.matrix[p.y][p.x] = value
    }

    isValid (point) {
        let {x, y} = point
        return x >= 0 && y >= 0 && x < this.width && y < this.height
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
}