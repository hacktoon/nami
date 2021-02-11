import { PointSet } from '/lib/point/set'
import { Color } from '/lib/base/color'


export class Region {
    constructor(id, origin) {
        this.id = id
        this.origin = origin
        this.size = 1
        this.borders = new PointSet()
        this.color = new Color()
        this.neighbors = new Set()
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
