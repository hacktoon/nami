import { Color } from '/lib/base/color'
import { Matrix } from '/lib/base/matrix'
import { MultiFill } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'


const NO_REGION = null
const NO_BORDER = null


export class Regions {
    constructor(origins, params) {
        const [width, height] = params.get('width', 'height')
        this.regionList = origins.map((origin, id) => new Region(id, origin))
        this.regionMap = Object.fromEntries(this.regionList.map(reg => [reg.id, reg]))
        this.regionMatrix = new Matrix(width, height, () => NO_REGION)
        this.borderMatrix = new Matrix(width, height, () => NO_BORDER)
        this.origins = origins
        this.#buildRegions(params)
    }

    #buildRegions(params) {
        const fills = this.map(region => {
            const fillConfig = new RegionFillConfig(this, region, params)
            return new OrganicFloodFill(region.origin, fillConfig)
        })
        const multiFill = new MultiFill(fills)
        multiFill.fill()
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


class Region {
    constructor(id, origin) {
        this.id = id
        this.origin = origin
        this.color = new Color()
    }

    get area() {
        return 1
    }
}


class RegionFillConfig {
    constructor(regions, region, params) {
        this.chance = params.get('chance')
        this.growth = params.get('growth')
        this.regions = regions
        this.region = region
    }

    isEmpty(point) {
        return this.regions.isEmpty(point)
    }

    setValue(point) {
        this.regions.regionMatrix.set(point, this.region.id)
    }

    checkNeighbor(neighbor, origin) {
        const neighborId = this.regions.regionMatrix.get(neighbor)
        if (neighborId === NO_REGION) return
        if (neighborId === this.region.id) return
        this.regions.borderMatrix.set(origin, neighborId)
    }
}