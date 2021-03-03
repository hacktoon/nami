import { Color } from '/lib/base/color'
import { Matrix } from '/lib/base/matrix'


const NO_REGION = null
const NO_BORDER = null


export class Regions {
    constructor(origins, width, height) {
        this.regionMatrix = new Matrix(width, height, () => NO_REGION)
        this.borderMatrix = new Matrix(width, height, () => NO_BORDER)
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

    isEmpty(point) {
        return this.regionMatrix.get(point) === NO_REGION
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