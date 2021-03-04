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
        this.matrix = new RegionMatrix(width, height)
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
        const id = this.matrix.getRegionId(point)
        return this.regionMap[id]
    }

    getBorderRegion(point) {
        const id = this.matrix.getBorderId(point)
        return this.regionMap[id]
    }

    isEmpty(point) {
        return this.matrix.getRegionId(point) === NO_REGION
    }

    isBorder(point) {
        return this.matrix.getBorderId(point) !== NO_BORDER
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


class RegionMatrix {
    constructor(width, height) {
        this.regionIdMatrix = new Matrix(width, height, () => NO_REGION)
        this.borderMatrix = new Matrix(width, height, () => NO_BORDER)
    }

    setRegion(point, id) {
        return this.regionIdMatrix.set(point, id)
    }

    setBorder(point, id) {
        return this.borderMatrix.set(point, id)
    }

    getRegionId(point) {
        return this.regionIdMatrix.get(point)
    }

    getBorderId(point) {
        return this.borderMatrix.get(point)
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
        this.regions.matrix.setRegion(point, this.region.id)
    }

    checkNeighbor(neighbor, origin) {
        const neighborId = this.regions.matrix.getRegionId(neighbor)
        if (neighborId === NO_REGION) return
        if (neighborId === this.region.id) return
        this.regions.matrix.setBorder(origin, neighborId)
    }
}