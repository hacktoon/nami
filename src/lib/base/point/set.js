import { Random } from '/lib/base/random'


export class PointSet2 {
    constructor() {
        this.size = 0
        this.map = {}
    }

    has([x, y]) {
        if (! this.map[x]) return false
        return this.map[x][y]
    }

    add([x, y]) {
        if (! this.map[x]) {
            this.map[x] = {}
        }
        const yobj = this.map[x]
        if (! yobj[y]) {
            yobj[y] = true
            this.size++
        }
    }

    delete(point) {
        if (! this.has(point)) return false
        const [x, y] = point
        delete this.map[x][y]
        if (Object.values(this.map[x]).length == 0) {
            delete this.map[x]
        }
        this.size--
        return true
    }

    random() {
        const x = Random.choiceFrom(Object.keys(this.map))
        const y = Random.choiceFrom(Object.keys(this.map[x]))
        return [Number(x), Number(y)]
    }
}

export class PointSet {
    #size
    #index
    #width

    constructor(width, height) {
        this.#size = width * height
        this.#width = width
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
            points.push([x, y])
        })
        return points
    }

    random() {
        const width = this.#width
        const index = Random.choiceFrom(Array.from(this.#index))
        const x = Math.floor(index % width)
        const y = Math.floor(index / width)
        return [x, y]
    }

    has([x, y]) {
        const index = x + this.#width * y
        return this.#index.has(index)
    }

    delete([x, y]) {
        // column-major order
        const index = x + this.#width * y
        this.#index.delete(index)
    }
}