import { Color } from '/lib/base/color'


export class Regions {
    constructor(origins) {
        this.regionMap = {}
        this.regionList = origins.map((origin, id) => {
            const region = new Region(id, origin)
            this.regionMap[id] = region
            return region
        })
        this.origins = origins
    }

    get(id) {
        return this.regionMap[id]
    }

    forEach(callback) {
        this.regionList.forEach(callback)
    }

    map(callback) {
        return this.regionList.map(callback)
    }

    get length() {
        return this.origins.length
    }
}


class Region {
    constructor(id, origin) {
        this.id = id
        this.origin = origin
        this.area = 0
        this.color = new Color()
    }
}