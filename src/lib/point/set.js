import { Random } from '/lib/random'
import { Point } from '/lib/point'


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
        this.map = new Map()
        this.add(...points)
    }

    has(point) {
        const {x, y} = point
        if (! this.map.has(x)) return false
        return this.map.get(x).has(y)
    }

    add(...points) {
        points.forEach(({x, y}) => {
            if (! this.map.has(x)) {
                this.map.set(x, new Set())
            }
            const set = this.map.get(x)
            if (! set.has(y)) {
                set.add(y)
                this.size++
            }
        })
    }

    delete(point) {
        const {x, y} = point
        if (! this.map.has(x)) return false
        const set = this.map.get(x)
        if (set.delete(y)) {
            this.size--
        }
        if (set.size == 0) {
            this.map.delete(x)
            return true
        }
        return false
    }

    random() {
        const x = Random.choice(Array.from(this.map.keys()))
        const y = Random.choice(Array.from(this.map.get(x).values()))
        return new Point(x, y)
    }
}