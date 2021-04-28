import { Color } from '/lib/base/color'
import { Matrix } from '/lib/base/matrix'
import { Graph } from '/lib/base/graph'


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
        this.graph = new Graph()
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

    addBorder(point, region, neighborRegion) {
        const borderSet = this.borderMatrix.get(point)
        borderSet.add(neighborRegion.id)
        this.graph.setEdge(region.id, neighborRegion.id)
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
        this.model = config.model
    }

    isEmpty(point) {
        return this.model.isEmpty(point)
    }

    setValue(point) {
        this.model.setRegion(point, this.region)
        this.region.area += 1
    }

    checkNeighbor(neighborPoint, originPoint) {
        if (this.model.isEmpty(neighborPoint)) return
        const neighborRegion = this.model.getRegion(neighborPoint)
        if (this.region.id === neighborRegion.id) return
        this.model.addBorder(originPoint, this.region, neighborRegion)
    }

    getNeighbors(originPoint) {
        return originPoint.adjacents()
    }
}