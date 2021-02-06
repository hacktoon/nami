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

    merge(otherPointSet) {
        const pointSet = new PointSet(...this.points)
        otherPointSet.forEach(point => pointSet.add(point))
        return pointSet
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