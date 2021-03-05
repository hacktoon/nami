import { Color } from '/lib/base/color'
import { Matrix } from '/lib/base/matrix'


const NO_REGION = null
const NO_BORDER = null


export class Region {
    constructor(id, origin) {
        this.id = id
        this.origin = origin
        this.area = 0
        this.color = new Color()
    }
}


export class RegionMatrix {
    constructor(width, height) {
        this.regionIdMatrix = new Matrix(width, height, () => NO_REGION)
        this.borderMatrix = new Matrix(width, height, () => NO_BORDER)
    }

    isEmpty(point) {
        return this.regionIdMatrix.get(point) === NO_REGION
    }

    isBorder(point) {
        return this.borderMatrix.get(point) !== NO_BORDER
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


export class RegionFillConfig {
    constructor(refs, params) {
        this.chance = params.get('chance')
        this.growth = params.get('growth')
        this.currentRegion = refs.region
        this.adjacency = refs.adjacency
        this.matrix = refs.matrix
    }

    isEmpty(point) {
        return this.matrix.isEmpty(point)
    }

    setValue(point) {
        this.matrix.setRegion(point, this.currentRegion.id)
        this.currentRegion.area += 1
    }

    checkNeighbor(neighbor, origin) {
        const regionId = this.currentRegion.id
        const neighborId = this.matrix.getRegionId(neighbor)
        if (neighborId === NO_REGION) return
        if (neighborId === regionId) return
        this.matrix.setBorder(origin, neighborId)
        this.adjacency.setEdge(regionId, neighborId)
    }
}