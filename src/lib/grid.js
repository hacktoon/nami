import { Rect } from '/src/lib/number'


export class Grid {
    #rect
    #cells

    constructor(width, height, buildCell=() => null) {
        this.#rect = new Rect(width, height)
        this.#cells = []

        // sweep from left to right, top down
        const max = this.#rect.area
        for (let index = 0; index < max; index++) {
            const [x, y] = this.#rect.indexToPoint(index)
            this.#cells.push(buildCell([x, y]))
        }
    }

    static fromRect(rect, buildCell) {
        return new Grid(rect.width, rect.height, buildCell)
    }

    get width() {
        return this.#rect.width
    }

    get height() {
        return this.#rect.height
    }

    get area() {
        return this.#rect.area
    }

    set(point, value) {
        const [x, y] = this.wrap(point)
        const index = this.#rect.pointToIndex([x, y])
        this.#cells[index] = value
    }

    get(point) {
        const [x, y] = this.wrap(point)
        const index = this.#rect.pointToIndex([x, y])
        return this.#cells[index]
    }

    wrapSet(point, value) {
        const [x, y] = this.wrap(point)
        const index = this.#rect.pointToIndex([x, y])
        this.#cells[index] = value
    }

    wrapGet(point) {
        const [x, y] = this.wrap(point)
        const index = this.#rect.pointToIndex([x, y])
        return this.#cells[index]
    }

    forEach(callback) {
        const max = this.#rect.area
        for (let index = 0; index < max; index++) {
            const point = this.#rect.indexToPoint(index)
            callback(point, this.#cells[index])
        }
    }

    // TODO: remove
    wrap(point) {
        return this.#rect.wrap(point)
    }
}
