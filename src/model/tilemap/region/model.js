import { PairMap } from '/lib/base'
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
        this.directions = data.directions
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
            graph: new Graph()
        }
        const regions = this._buildRegions(origins, data)
        const directions = this._buildDirections(regions, data)
        return {...data, regions, directions}
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


    _buildDirections(regions, data) {
        const directions = new PairMap()
        const matrix = data.regionMatrix
        regions.forEach(region => {
            data.graph.getEdges(region.id).forEach(neighborId => {
                const neighbor = regions.get(neighborId)
                const wrappedNeighborOrigin = this._wrapOrigin(region, neighbor, matrix)
                const angle = region.origin.angle(wrappedNeighborOrigin)
                const direction = Direction.fromAngle(angle)
                directions.set(region.id, neighborId, direction)
            })
        })
        return directions
    }

    _wrapOrigin(source, target, matrix) {
        const {x:sX, y:sY} = source.origin
        const {x:tX, y:tY} = target.origin
        const deltaX = Math.abs(sX - tX)
        const deltaY = Math.abs(sY - tY)
        let {x, y} = target.origin
        if (deltaX > matrix.width / 2) {
            if (sX < tX) x -= matrix.width
            if (sX > tX) x += matrix.width
        }
        if (deltaY > matrix.height / 2) {
            if (sY < tY) y -= matrix.height
            if (sY > tY) y += matrix.height
        }
        return new Point(x, y)
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
        // mark region when neighbor point is filled by other region
        this.model.graph.setEdge(this.id, neighborId)
        this.model.borderMatrix.get(fillPoint).add(neighborId)
    }

    getNeighbors(originPoint) {
        return originPoint.adjacents()
    }
}
