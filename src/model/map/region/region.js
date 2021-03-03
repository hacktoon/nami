import { Color } from '/lib/base/color'
import { Matrix } from '/lib/base/matrix'
import { MultiFill } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'


const NO_REGION = null
const NO_BORDER = null


export class Regions {
    constructor(origins, params) {
        const [width, height] = params.get('width', 'height')
        this.regionMatrix = new Matrix(width, height, () => NO_REGION)
        this.borderMatrix = new Matrix(width, height, () => NO_BORDER)
        this.regionList = origins.map((origin, id) => new Region(id, origin))
        this.regionMap = Object.fromEntries(this.regionList.map(reg => [reg.id, reg]))
        this.origins = origins
        fillRegions(this, params)
    }

    get(point) {
        const id = this.regionMatrix.get(point)
        return this.regionMap[id]
    }

    getBorderRegion(point) {
        const id = this.borderMatrix.get(point)
        return this.regionMap[id]
    }

    isEmpty(point) {
        return this.regionMatrix.get(point) === NO_REGION
    }

    isBorder(point) {
        return this.borderMatrix.get(point) !== NO_BORDER
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


function fillRegions(regions, params) {
    function buildParams(region) {
        return {
            chance:   params.get('chance'),
            growth:   params.get('growth'),
            isEmpty:  point => regions.isEmpty(point),
            setValue: point => regions.regionMatrix.set(point, region.id),
            checkNeighbor: (neighbor, origin) => {
                const neighborId = regions.regionMatrix.get(neighbor)
                if (neighborId === NO_REGION) return
                if (neighborId === region.id) return
                regions.borderMatrix.set(origin, neighborId)
            }
        }
    }
    const fills = regions.map(region => {
        return new OrganicFloodFill(region.origin, buildParams(region))
    })
    new MultiFill(fills)
}


class Region {
    constructor(id, origin) {
        this.id = id
        this.origin = origin
        this.area = 1
        this.color = new Color()
    }
}
