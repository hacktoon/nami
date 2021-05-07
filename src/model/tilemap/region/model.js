import { Color } from '/lib/base/color'
import { Matrix } from '/lib/base/matrix'
import { Graph } from '/lib/base/graph'
import { EvenPointSampling } from '/lib/base/point/sampling'
import { MultiFill } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'


const NO_REGION = null


export class Region {
    constructor({id, origin, area, color}) {
        this.id = id
        this.origin = origin
        this.area = area
        this.color = color
    }
}


export class RegionMapModel {
    constructor(params) {
        const [width, height] = params.get('width', 'height')

        this.regionMatrix = new Matrix(width, height, () => NO_REGION)
        this.borderMatrix = new Matrix(width, height, () => new Set())
        this.chance = params.get('chance')
        this.growth = params.get('growth')
        this.graph = new Graph()
        this.regions = this._buildRegions(params)
    }

    _buildRegions(params) {
        const [width, height, scale] = params.get('width', 'height', 'scale')
        const origins = EvenPointSampling.create(width, height, scale)
        const multiFill = new MultiFill(origins.map((origin, id) => {
            const fillConfig = new RegionFillConfig(id, this)
            return new OrganicFloodFill(origin, fillConfig)
        }))

        return multiFill.map(fill => this._buildRegion(fill))
    }

    _buildRegion(fill) {
        const color = fill.count === 1 ? Color.fromHex('#FFF') : new Color()
        const region = new Region({
            id: fill.config.id,
            origin: fill.origin,
            area: fill.count,
            color,
        })
        return region
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