import { Color } from '/lib/base/color'
import { Matrix } from '/lib/base/matrix'
import { Graph } from '/lib/base/graph'
import { EvenPointSampling } from '/lib/base/point/sampling'
import { MultiFill } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'


const NO_REGION = null


export class Region {
    constructor({id, origin, area}) {
        this.id = id
        this.origin = origin
        this.area = area
        this.color = new Color()
    }
}


export class RegionMapModel {
    constructor(params) {
        const data = this._build(params)
        this.regionMatrix = data.regionMatrix
        this.borderMatrix = data.borderMatrix
        this.regions = data.regions
        this.graph = data.graph
    }

    _build(params) {
        const [width, height, scale] = params.get('width', 'height', 'scale')
        const data = {
            regionMatrix: new Matrix(width, height, () => NO_REGION),
            borderMatrix: new Matrix(width, height, () => new Set()),
            chance: params.get('chance'),
            growth: params.get('growth'),
            regions: new Map(),
            graph: new Graph(),
        }
        const origins = EvenPointSampling.create(width, height, scale)
        const fills = origins.map((origin, id) => {
            const fillConfig = new RegionFillConfig(id, data)
            return new OrganicFloodFill(origin, fillConfig)
        })

        new MultiFill(fills).forEach(fill => {
            const region = new Region({
                id: fill.config.id,
                origin: fill.origin,
                area: fill.count
            })
            data.regions.set(region.id, region)
        })

        return data
    }
}


export class RegionFillConfig {
    constructor(id, model) {
        this.id = id
        this.model = model
        // TODO: create OrganicFloodFill methods to obtain these values
        this.chance = model.chance
        this.growth = model.growth
    }

    isEmpty(point) {
        return this.model.regionMatrix.get(point) === NO_REGION
    }

    setValue(point) {
        this.model.regionMatrix.set(point, this.id)
    }

    checkNeighbor(neighborPoint, originPoint) {
        if (this.isEmpty(neighborPoint)) return
        const neighborId = this.model.regionMatrix.get(neighborPoint)
        if (this.id === neighborId) return
        this.model.graph.setEdge(this.id, neighborId)
        this.model.borderMatrix.get(originPoint).add(neighborId)
    }

    getNeighbors(originPoint) {
        return originPoint.adjacents()
    }
}