import { Color } from '/lib/base/color'
import { Matrix } from '/lib/base/matrix'
import { Direction } from '/lib/base/direction'
import { Point } from '/lib/base/point'
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
        const origins = EvenPointSampling.create(width, height, scale)
        const data = {
            regionMatrix: new Matrix(width, height, () => NO_REGION),
            borderMatrix: new Matrix(width, height, () => new Set()),
            chance: params.get('chance'),
            growth: params.get('growth'),
            regions: new Map(),
            graph: new Graph(),
            origins,
        }
        const fills = origins.map((origin, id) => {
            const fillConfig = new RegionFillConfig(id, origin, data)
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

    setValue(point) {
        this.model.regionMatrix.set(point, this.id)
    }

    checkNeighbor(neighborPoint, fillPoint) {
        if (this.isEmpty(neighborPoint)) return
        const neighborId = this.model.regionMatrix.get(neighborPoint)
        if (this.id === neighborId) return
        if (this.model.regionMatrix.isWrappable(fillPoint) &&
            this.id == 89 && neighborId == 95) {
            const wrappedOrigin = this.getUnboundedOrigin(fillPoint)

            // const angle = angleOf(fillPoint, neighborPoint)
            // let msg = `${fillPoint.hash} to ${neighborPoint.hash}, ${angle}°`
            let msg = ` - wrappedOrigin: ${wrappedOrigin.hash}`
            console.log(msg)
            // map(ngbId) to map(id, wrpOrg)
            // this.model.wrapMap.set(neighborId, this.id, wrappedOrigin)
        }
        this.model.graph.setEdge(this.id, neighborId)
        this.model.borderMatrix.get(fillPoint).add(neighborId)
    }

    getNeighbors(originPoint) {
        return originPoint.adjacents()
    }

    // Private methods
    getUnboundedOrigin(fillPoint) {
        const {width, height} = this.model.regionMatrix
        let {x, y} = this.origin
        if (fillPoint.x < 0) x += width
        if (fillPoint.y < 0) y += height
        if (fillPoint.x >= width) x -= width
        if (fillPoint.y >= height) y -= height
        return new Point(x, y)
    }

}


function angleOf(p1, p2) {
    let deltaY = (p1.y - p2.y);
    let deltaX = (p2.x - p1.x);
    let result = Math.atan2(deltaY, deltaX) * (180 / Math.PI)
    return Math.round((result < 0) ? (360 + result) : result)
}