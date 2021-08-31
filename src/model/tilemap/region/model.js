import { Color } from '/lib/base/color'
import { Point } from '/lib/base/point'
import { Matrix } from '/lib/base/matrix'
import { Graph } from '/lib/base/graph'
import { EvenPointSampling } from '/lib/base/point/sampling'
import { MultiFill } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'
import { RegionFloodFill } from '/lib/floodfill/region'


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
        this.levelMatrix = data.levelMatrix
        this.borderMatrix = data.borderMatrix
        this.regions = data.regions
        this.graph = data.graph
    }

    _build(params) {
        const [width, height, scale] = params.get('width', 'height', 'scale')
        const origins = EvenPointSampling.create(width, height, scale)
        const data = {
            regionMatrix: new Matrix(width, height, () => NO_REGION),
            levelMatrix: new Matrix(width, height, () => 0),
            borderMatrix: new Matrix(width, height, () => new Set()),
            chance: params.get('chance'),
            growth: params.get('growth'),
            graph: new Graph()
        }
        const regions = this._buildRegions_new(origins, data)
        return {...data, regions}
    }

    _buildRegions(origins, data) {
        const regions = new Map()
        const multifill = new MultiFill(origins.map((origin, id) => {
            const fillConfig = new RegionFillConfig(id, origin, data)
            return new OrganicFloodFill(origin, fillConfig)
        }))
        multifill.forEach(fill => {
            const region = new Region({
                id: fill.config.id,
                origin: fill.origin,
                area: fill.count
            })
            regions.set(region.id, region)
        })
        return regions
    }

    _buildRegions_new(origins, data) {
        const regions = new Map()
        const multifill = new MultiFill(origins.map((origin, id) => {
            const fillConfig = new RegionFillConfig(id, origin, data)
            return new RegionFloodFill(origin, fillConfig)
        }))
        multifill.forEach(fill => {
            const region = new Region({
                id: fill.config.id,
                origin: fill.origin,
                area: fill.count
            })
            regions.set(region.id, region)
        })
        return regions
    }
}


export class RegionFillConfig {
    constructor(id, origin, model) {
        this.id = id
        this.origin = origin
        this.model = model
        // TODO: create OrganicFloodFill methods to obtain these values
        this.chance = model.chance
        this.growth = model.growth
    }

    isEmpty(point) {
        return this.model.regionMatrix.get(point) === NO_REGION
    }

    setValue(point, level) {
        this.model.regionMatrix.set(point, this.id)
        this.model.levelMatrix.set(point, level)
    }

    checkNeighbor(neighborPoint, fillPoint) {
        if (this.isEmpty(neighborPoint)) return
        const neighborId = this.model.regionMatrix.get(neighborPoint)
        if (this.id === neighborId) return
        // mark region when neighbor point is filled by other region
        this.model.graph.setEdge(this.id, neighborId)
        this.model.borderMatrix.get(fillPoint).add(neighborId)
    }

    getNeighbors(originPoint) {
        return Point.adjacents(originPoint)
    }
}


class MultiFill2 {
    constructor(fills) {
        this.fills = fills
        this.canGrow = true

        while(this.canGrow) {
            this._growFills()
        }
    }

    map(callback) {
        return this.fills.map(fill => callback(fill))
    }

    forEach(callback) {
        this.fills.forEach(callback)
    }

    _growFills() {
        let completedFills = 0
        for(let fill of this.fills) {
            const filledPoints = fill.grow()
            if (filledPoints.length === 0) {
                completedFills++
            }
        }
        if (completedFills === this.fills.length) {
            this.canGrow = false
        }
    }
}