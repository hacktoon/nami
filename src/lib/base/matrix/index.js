import { Point } from '/lib/base/point'
import { Rect } from '/lib/base/number'


export class Matrix {
    constructor(width, height, buildValue=()=>null) {
        this.width = width
        this.height = height
        this.area = width * height
        this.rect = new Rect(width, height)
        this.matrix = []

        for (let y = 0; y < this.height; y++) {
            this.matrix.push([])
            for (let x = 0; x < this.width; x++) {
                const value = buildValue(new Point(x, y))
                this.matrix[y].push(value)
            }
        }
    }

    get(point) {
        let {x, y} = this.wrap(point)
        return this.matrix[y][x]
    }

    set(point, value) {
        let {x, y} = this.wrap(point)
        this.matrix[y][x] = value
    }

    wrap(point) {
        return this.rect.wrap(point)
    }

    forEach(callback) {

    }
}
