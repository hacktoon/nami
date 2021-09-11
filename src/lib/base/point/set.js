import { Random } from '/lib/base/random'


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


export class PointSet2 {
    constructor(width, height) {
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


export class RandomPointQueue {
	constructor(width, height) {
		this.array = []
        this.width = width
        this.height = height
        const size = width * height
        for(let i = 0; i < size; i++) {
            this.array.push(i)
        }
    }

	has([x, y]) {
        const index = x + this.width * y
        return this.array.has(index)
    }

	push(item) {
        this.array.push(item)
    }

	pop() {
        const length = this.array.length

		if (length <= 0) {
			throw new Error('Cannot pop from empty array!')
        } else if (length == 1) {
			return this.array.pop()
        } else {
			const j = length - 1
			const i = Random.int(0, j)
            const swap = this.array[i]
			this.array[i] = this.array[j]
            this.array[j] = swap
        }
		return this.array.pop()
    }
}
