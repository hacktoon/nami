import { Random } from '/lib/random'


export class PointSet {
    constructor(width, height, points=null) {
        this.size = 0
        this.map = new Map()
        if (points === null) {
            for(let x=0; x<width; x++) {
                for(let y=0; y<height; y++) {
                    this.add([x, y])
                }
            }
        } else {
            for(let point of points) {
                this.add(point)
            }
        }
    }

    add([x, y]) {
        if (! this.map.has(x)) {
            this.map.set(x, new Set())
        }
        const column = this.map.get(x)
        if (! column.has(y)) {
            column.add(y)
            this.size++
        }
    }

    has([x, y]) {
        if (! this.map.has(x)) return false
        return this.map.get(x).has(y)
    }

    delete(point) {
        if (! this.has(point)) return false
        const [x, y] = point
        const column = this.map.get(x)
        column.delete(y)
        if (column.size === 0) {
            this.map.delete(x)
        }
        this.size--
    }

    random() {
        const x = Random.choiceFrom(Array.from(this.map.keys()))
        const y = Random.choiceFrom(Array.from(this.map.get(x).keys()))
        return [Number(x), Number(y)]
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
