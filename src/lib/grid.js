
export class Grid {
    #cells

    constructor(width, height, buildCell=() => null) {
        this.width = width
        this.height = height
        this.#cells = []

        // sweep from left to right, top down
        const max = width * height
        for (let idx = 0; idx < max; idx++) {
            const [x, y] = this.indexToPoint(idx)
            this.#cells.push(buildCell([x, y]))
        }
    }

    static fromRect(rect, buildCell) {
        const {width, height} = rect
        return new Grid(width, height, buildCell)
    }

    get area() {
        return this.width * this.height
    }

    get(point) {
        const [x, y] = this.wrap(point)
        const index = this.pointToIndex([x, y])
        return this.#cells[index]
    }

    set(point, value) {
        const [x, y] = this.wrap(point)
        const index = this.pointToIndex([x, y])
        this.#cells[index] = value
    }

    pointToIndex([x, y]) {
        // https://en.wikipedia.org/wiki/Row-_and_column-major_order
        return x + this.width * y
    }

    indexToPoint(index) {
        const y = Math.floor(index / this.width)
        const x = index % this.width
        return [x, y]
    }

    forEach(callback) {
        const max = this.width * this.height
        for (let idx = 0; idx < max; idx++) {
            const point = this.indexToPoint(idx)
            callback(point, this.#cells[idx])
        }
    }

    wrap(point) {
        let [x, y] = point
        if (x >= this.width) { x %= this.width }
        if (y >= this.height) { y %= this.height }
        if (x < 0) { x = this.width - 1 - Math.abs(x + 1) % this.width }
        if (y < 0) { y = this.height - 1 - Math.abs(y + 1) % this.height }
        return [x, y]
    }
}
