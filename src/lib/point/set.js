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
        return true
    }

    random() {
        const x = Random.choiceFrom(Array.from(this.map.keys()))
        const y = Random.choiceFrom(Array.from(this.map.get(x).keys()))
        return [Number(x), Number(y)]
    }
}
