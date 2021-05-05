import { Color } from '/lib/base/color'
import { Matrix } from '/lib/base/matrix'
import { Graph } from '/lib/base/graph'
import { EvenPointSampling } from '/lib/base/point/sampling'
import { MultiFill } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'


const NO_REGION = null


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
        const [width, height, scale] = params.get('width', 'height', 'scale')
        const origins = EvenPointSampling.create(width, height, scale)

        this.regions = origins.map((origin, id) => new Region(id, origin))
        this.regionMatrix = new Matrix(width, height, () => NO_REGION)
        this.borderMatrix = new Matrix(width, height, () => new Set())
        this.graph = new Graph()

        this._build(params)
    }

    _build(params) {
        const organicFills = this.regions.map(region => {
            const fillConfig = new RegionFillConfig(region, {
                chance: params.get('chance'),
                growth: params.get('growth'),
                regionMatrix: this.regionMatrix,
                borderMatrix: this.borderMatrix,
                graph: this.graph,
            })
            return new OrganicFloodFill(region.origin, fillConfig)
        })
        new MultiFill(organicFills).fill()
    }
}


export class RegionFillConfig {
    constructor(region, config) {
        this.region = region
        this.chance = config.chance
        this.growth = config.growth
        this.regionMatrix = config.regionMatrix
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