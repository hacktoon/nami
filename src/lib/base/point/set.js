import { Random } from '/lib/base/random'
import { Point } from '/lib/base/point'
import { Matrix } from '/lib/base/matrix'


/*
Maps x as a Map and the y's for this x in a Set
4 => [-1, 4, 3]
6 => [2, 10, -5]
Points represented for the data above:
(4, -1), (4, 4), (4, 3),
(6, 2), (6, 10), (6, -5),
*/

export class PointSet {
    static fromRect(rect) {
        const pointSet = new PointSet()
        for(let i = 0; i < rect.width; i++) {
            for(let j = 0; j < rect.height; j++) {
                pointSet.add(new Point(i, j))
            }
        }
        return pointSet
    }

    constructor(...points) {
        this.size = 0
        this.map = {}
        this.add(...points)
    }

    get points() {
        const pointList = []
        this.forEach(point => {
            pointList.push(point)
        })
        return pointList
    }

    has(point) {
        const {x, y} = point
        if (! this.map.hasOwnProperty(x)) return false
        return this.map[x].hasOwnProperty(y)
    }

    forEach(callback) {
        Object.entries(this.map).forEach(([x, yobj]) => {
            Object.keys(yobj).forEach(y => {
                callback(new Point(Number(x), Number(y)))
            })
        })
    }

    filter(callback) {
        const pointSet = new PointSet()
        this.forEach(point => {
            if (callback(point)) pointSet.add(point)
        })
        return pointSet
    }

    add(...points) {
        points.forEach(point => {
            const {x, y} = point
            if (! this.map.hasOwnProperty(x)) {
                this.map[x] = {}
            }
            const yobj = this.map[x]
            if (! yobj.hasOwnProperty(y)) {
                yobj[y] = true
                this.size++
            }
        })
    }

    delete(point) {
        if (! this.has(point)) return false
        const {x, y} = point
        delete this.map[x][y]
        if (Object.values(this.map[x]).length == 0) {
            delete this.map[x]
        }
        this.size--
        return true
    }

    random() {
        const x = Random.choice(...Object.keys(this.map))
        const y = Random.choice(...Object.keys(this.map[x]))
        return new Point(Number(x), Number(y))
    }
}


export class PointSchedule {
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
        const index = Random.choiceFrom(Array.from(this.#index))
        const x = Math.floor(index % width)
        const y = Math.floor(index / width)
        return new Point(x, y)
    }

    delete(point) {
        // column-major order
        // k = i + (j * total_no_of_rows_in_matrix)
        const index = point.x + this.#width * point.y
        this.#index.delete(index)
    }
}