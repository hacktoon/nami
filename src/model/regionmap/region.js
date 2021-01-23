import { PointSet } from '/lib/point/set'
import { Color } from '/lib/color'


export class Region {
    constructor(id, origin) {
        this.id = id
        this.origin = origin
        this.points = new PointSet(origin)
        this.borders = new PointSet()
        this.color = new Color()
    }

    get size() {
        return this.points.size
    }

    has(point) {
        return this.points.has(point)
    }

    addBorder(point, neighbor) {
        this.borders.add(point)
    }

    grow(points) {
        this.points.add(...points)
        return points.length
    }
}


export class RegionSet {
    constructor(origins) {
        this.origins = origins
        this.regions = this.origins.map((origin, id) => new Region(id, origin))
    }

    get(id) {
        return this.regions[id]
    }

    forEach(callback) {
        return this.regions.forEach(callback)
    }

    map(callback) {
        return this.regions.map(callback)
    }
}
