import { Random } from '/lib/random'


export class RectPointSet {
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



export class RegionOriginSet {
    #points

    constructor(points) {
        this.#points = points
    }

}



export class RandomPointQueue {
    #points

	constructor(points) {
		this.#points = points
        this.width = width
        this.height = height
        const size = width * height
        for(let i = 0; i < size; i++) {
            this.#points.push(i)
        }
    }

	has([x, y]) {
        const index = x + this.width * y
        return this.#points.has(index)
    }

	push(item) {
        this.#points.push(item)
    }

	pop() {
        const length = this.#points.length

		if (length <= 0) {
			throw new Error('Cannot pop from empty array!')
        } else if (length == 1) {
			return this.#points.pop()
        } else {
			const j = length - 1
			const i = Random.int(0, j)
            const swap = this.#points[i]
			this.#points[i] = this.#points[j]
            this.#points[j] = swap
        }
		return this.#points.pop()
    }
}
