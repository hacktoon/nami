import { Point } from '/lib/point'


export class Grid {
    constructor(width, height, buildValue=()=>null) {
        this.width = width
        this.height = height
        this.area = width * height
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
        let {x, y} = point
        if (x >= this.width) { x %= this.width }
        if (y >= this.height) { y %= this.height }
        if (x < 0) { x = this.width - 1 - Math.abs(x + 1) % this.width }
        if (y < 0) { y = this.height - 1 - Math.abs(y + 1) % this.height }
        return new Point(x, y)
    }
}
