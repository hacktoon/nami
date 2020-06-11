import { PointHash } from '/lib/point'


export class Region {
    constructor(id, origin, organicFill) { // TODO: remove organicFill
        this.id = id
        this.origin = origin
        this.organicFill = organicFill
        this.pointHash = new PointHash([origin])
    }

    get size() {
        return this.pointHash.size
    }

    get points() {
        return this.pointHash.points
    }

    has(point) {
        return this.pointHash.has(point)
    }

    grow() {
        const filled = this.organicFill.fill()
        this.pointHash.add(filled)
    }
}
