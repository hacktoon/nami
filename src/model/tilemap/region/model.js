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
            offsetOriginMap: new OffsetOriginMap(),
            chance: params.get('chance'),
            growth: params.get('growth'),
            graph: new Graph()
        }
        const regions = this._buildRegions(origins, data)

        regions.forEach(region => {
            data.graph.getEdges(region.id).forEach(edgeId => {
                let origin = regions.get(edgeId).origin
                if (data.offsetOriginMap.has(region.id, edgeId)) {
                    origin = data.offsetOriginMap.get(region.id, edgeId)
                }
                const angle = angleOf(region.origin, origin)
                console.log(`${region.id} -> ${edgeId} = ${angle}°`);
            })
        })
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

    _buildAngles(regions, offsetOriginMap) {

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
        if (this.model.regionMatrix.isWrappable(fillPoint)) {
            const offsetOrigin = this.getOffsetOrigin(fillPoint)
            this.model.offsetOriginMap.set(neighborId, this.id, offsetOrigin)
        }
        this.model.graph.setEdge(this.id, neighborId)
        this.model.borderMatrix.get(fillPoint).add(neighborId)
    }

    getNeighbors(originPoint) {
        return originPoint.adjacents()
    }

    // get the region origin out of the matrix bounds
    // for size = 150 and range 0-149, converts (-1, 4) to (150, 4)
    getOffsetOrigin(fillPoint) {
        const {width, height} = this.model.regionMatrix
        let {x, y} = this.origin
        if (fillPoint.x < 0) x += width
        if (fillPoint.y < 0) y += height
        if (fillPoint.x >= width) x -= width
        if (fillPoint.y >= height) y -= height
        return new Point(x, y)
    }
}


class OffsetOriginMap {
    constructor() {
        this._sources = new Map()
    }

    set(source, target, point) {
        if (! this._sources.has(source)) {
            this._sources.set(source, new Map())
        }
        const targets = this._sources.get(source)
        if (! targets.has(target)) {
            targets.set(target, point)
        }
    }

    has(source, target) {
        if (! this._sources.has(source)) return false
        return this._sources.get(source).has(target)
    }

    get(source, target) {
        return this._sources.get(source).get(target)
    }
}


function angleOf(p1, p2) {
    // normalize vectors
    const deltaY = p1.y - p2.y  // for Y getting bigger to the south
    const deltaX = p2.x - p1.x
    // get angle between vectors
    let result = Math.atan2(deltaY, deltaX)
    // convert from radians to degrees
    result *= 180 / Math.PI
    return Math.round((result < 0) ? (360 + result) : result)
}