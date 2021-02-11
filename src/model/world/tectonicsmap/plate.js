import { PointSet } from '/lib/base/point/set'


export class Plate {
    constructor(id) {
        this.id = id
        this.name = ''
        this.area = 1
        this.points = []
        this.neighbors = []
        this.pointSet = new PointSet(origin)
    }

    has(point) {
        return this.pointSet.has(point)
    }

    grow(points) {
        this.pointSet.add(...points)
    }
}
