import { Color } from '/lib/base/color'
import { Matrix } from '/lib/base/matrix'


const NO_REGION = null


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
        this.borderMatrix = new Matrix(width, height, () => new Set())
        this.index = new Map()
    }

    isEmpty(point) {
        return this.idMatrix.get(point) === NO_REGION
    }

    isBorder(point) {
        return this.borderMatrix.get(point).size > 0
    }

    setRegion(point, region) {
        this.index.set(region.id, region)
        this.idMatrix.set(point, region.id)
    }

    getRegion(point) {
        const id = this.idMatrix.get(point)
        return this.index.get(id)
    }

    getRegionById(id) {
        return this.index.get(id)
    }

    addBorder(point, id) {
        return this.borderMatrix.get(point).add(id)
    }

    getBorderRegionsAt(point) {
        const ids = Array.from(this.borderMatrix.get(point))
        return ids.map(id => this.index.get(id))
    }

    map(callback) {
        const entries = Array.from(this.index.values())
        return entries.map(callback)
    }

    forEach(callback) {
        this.index.forEach(callback)
    }
}


export class RegionFillConfig {
    constructor(config) {
        this.chance = config.chance
        this.growth = config.growth
        this.region = config.region
        this.graph = config.graph
        this.model = config.model
    }

    isEmpty(point) {
        return this.model.isEmpty(point)
    }

    setValue(point) {
        this.model.setRegion(point, this.region)
        this.region.area += 1
    }

    checkNeighbor(neighborPoint, origin) {
        const neighbor = this.model.getRegion(neighborPoint)
        if (this.model.isEmpty(neighborPoint)) return
        if (this.region.id === neighbor.id) return
        this.model.addBorder(origin, neighbor.id) //TODO: use point here?
        this.graph.setEdge(this.region.id, neighbor.id)
    }

    getNeighbors(origin) {
        return origin.adjacents()
    }
}