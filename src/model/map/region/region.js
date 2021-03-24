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


export class RegionMapTable {
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
    constructor(config) {
        this.chance = config.chance
        this.growth = config.growth
        this.currentRegion = config.region
        this.graph = config.graph
        this.table = config.table
    }

    isEmpty(point) {
        return this.table.isEmpty(point)
    }

    setValue(point) {
        this.table.setRegion(point, this.currentRegion.id)
        this.currentRegion.area += 1
    }

    checkNeighbor(neighbor, origin) {
        const regionId = this.currentRegion.id
        const neighborId = this.table.getRegionId(neighbor)
        if (neighborId === NO_REGION) return
        if (neighborId === regionId) return
        this.table.setBorder(origin, neighborId)
        this.graph.setEdge(regionId, neighborId)
    }

    getNeighbors(origin) {
        return origin.adjacents()
    }
}