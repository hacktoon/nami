import { Random } from '/lib/base/random'
import { Point } from '/lib/base/point'


export class PointSet {
    #size
    #index
    #width
    #height

    constructor(width, height) {
        this.#size = width * height
        this.#width = width
        this.#height = height
        this.#index = new Set()
        for(let i = 0; i < this.#size; i++) {
            this.#index.add(i)
        }
    }

    get size() {
        return this.#index.size
    }

    get points() {
        const points = []
        const width = this.#width
        this.#index.forEach(index => {
            const x = Math.floor(index % width)
            const y = Math.floor(index / width)
            points.push(new Point(x, y))
        })
        return points
    }

    random() {
        const width = this.#width
        const index = Random.choiceFrom(Array.from(this.#index))
        const x = Math.floor(index % width)
        const y = Math.floor(index / width)
        return new Point(x, y)
    }

    has(point) {
        const index = point.x + this.#width * point.y
        return this.#index.has(index)
    }

    delete(point) {
        // column-major order
        const index = point.x + this.#width * point.y
        this.#index.delete(index)
    }
}