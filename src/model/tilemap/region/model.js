import { Color } from '/lib/base/color'
import { Matrix } from '/lib/base/matrix'
import { Graph } from '/lib/base/graph'
import { EvenPointSampling } from '/lib/base/point/sampling'
import { MultiFill } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'


const NO_REGION = null


export function buildRegions(params) {
    const [width, height, scale] = params.get('width', 'height', 'scale')
    const origins = EvenPointSampling.create(width, height, scale)
    return origins.map((origin, id) => new Region(id, origin))
}


export class Region {
    constructor(id, origin) {
        this.id = id
        this.origin = origin
        this.area = 0
        this.color = new Color()
    }
}


export class RegionMapModel {
    constructor(params) {
        const [width, height] = params.get('width', 'height')
        this.regions = buildRegions(params)
        this.regionMatrix = new Matrix(width, height, () => NO_REGION)
        this.borderMatrix = new Matrix(width, height, () => new Set())
        this.graph = new Graph()

        const organicFills = this.regions.map(region => {
            const fillConfig = new RegionFillConfig(region, {
                chance: params.get('chance'),
                growth: params.get('growth'),
                idMatrix: this.regionMatrix,
                borderMatrix: this.borderMatrix,
                graph: this.graph,
            })
            return new OrganicFloodFill(region.origin, fillConfig)
        })
        new MultiFill(organicFills).fill()
    }

    isBorder(point) {
        return this.borderMatrix.get(point).size > 0
    }

    getRegion(point) {
        const id = this.regionMatrix.get(point)
        return this.getRegionById(id)
    }

    getRegionById(id) {
        return this.regions[id]
    }

    isNeighbor(id, neighborId) {
        return this.graph.hasEdge(id, neighborId)
    }

    getTileBorderRegions(point) {
        // a tile can have two different region neighbor points (Set)
        const ids = Array.from(this.borderMatrix.get(point))
        return ids.map(id => this.getRegionById(id))
    }

    map(callback) {
        return this.regions.map(callback)
    }

    forEach(callback) {
        this.regions.forEach(callback)
    }
}


export class RegionFillConfig {
    constructor(region, config) {
        this.region = region
        this.chance = config.chance
        this.growth = config.growth
        this.regionMatrix = config.idMatrix
        this.borderMatrix = config.borderMatrix
        this.graph = config.graph
    }

    isEmpty(point) {
        return this.regionMatrix.get(point) === NO_REGION
    }

    setValue(point) {
        this.regionMatrix.set(point, this.region.id)
        this.region.area += 1
    }

    checkNeighbor(neighborPoint, originPoint) {
        if (this.isEmpty(neighborPoint)) return
        const neighborId = this.regionMatrix.get(neighborPoint)
        if (this.region.id === neighborId) return
        this.graph.setEdge(this.region.id, neighborId)
        this.borderMatrix.get(originPoint).add(neighborId)
    }

    getNeighbors(originPoint) {
        return originPoint.adjacents()
    }
}