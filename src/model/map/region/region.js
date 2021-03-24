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
        this.idMatrix = new Matrix(width, height, () => NO_REGION)
        this.borderMatrix = new Matrix(width, height, () => NO_BORDER)
        this.index = new Map()
    }

    isEmpty(point) {
        return this.idMatrix.get(point) === NO_REGION
    }

    isBorder(point) {
        return this.borderMatrix.get(point) !== NO_BORDER
    }

    setRegion(point, region) {
        this.index.set(region.id, region)
        return this.idMatrix.set(point, region.id)
    }

    setBorder(point, id) {
        return this.borderMatrix.set(point, id)
    }

    getRegion(point) {
        const id = this.idMatrix.get(point)
        return this.index.get(id)
    }

    getRegionById(id) {
        return this.index.get(id)
    }

    getBorderRegion(point) {
        const id = this.borderMatrix.get(point)
        return this.index.get(id)
    }

    forEach(callback) {
        return this.index.forEach(callback)
    }
}


export class RegionFillConfig {
    constructor(config) {
        this.chance = config.chance
        this.growth = config.growth
        this.region = config.region
        this.graph = config.graph
        this.table = config.table
    }

    isEmpty(point) {
        return this.table.isEmpty(point)
    }

    setValue(point) {
        this.table.setRegion(point, this.region)
        this.region.area += 1
    }

    checkNeighbor(neighborPoint, origin) {
        const region = this.region
        const neighbor = this.table.getRegion(neighborPoint)
        if (this.table.isEmpty(neighborPoint)) return
        if (neighbor.id === region.id) return
        this.table.setBorder(origin, neighbor.id) //TODO: use point here?
        this.graph.setEdge(region.id, neighbor.id)
    }

    getNeighbors(origin) {
        return origin.adjacents()
    }
}