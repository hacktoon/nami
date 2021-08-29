import { PairMap } from '/lib/base'
import { Direction } from '/lib/base/direction'
import { Color } from '/lib/base/color'
import { Point } from '/lib/base/point'
import { Graph } from '/lib/base/graph'
import { EvenPointSampling } from '/lib/base/point/sampling'
import { MultiFill } from '/lib/floodfill'
import { OrganicFloodFill } from '/lib/floodfill/organic'

import { RegionTileMap } from '/model/tilemap/region'


class RegionGroup {
    constructor(id, region, area) {
        this.id = id
        this.origin = region.origin
        this.color = new Color()
        this.area = area
    }
}


export class RegionGroupModel {
    constructor(seed, params) {
        const data = this._build(seed, params)
        this.directions = data.directions
        this.borderRegions = data.borderRegions
        this.regionToGroup = data.regionToGroup
        this.regionTileMap = data.regionTileMap
        this.groups = data.groups
        this.graph = data.graph
    }

    _build(seed, params) {
        const [width, height] = params.get('width', 'height')
        const groupScale = params.get('groupScale')
        const data = {
            regionTileMap: this._buildRegionTileMap(seed, params),
            groupChance: params.get('groupChance'),
            groupGrowth: params.get('groupGrowth'),
            borderRegions: new Set(),
            regionToGroup: new Map(),
            graph: new Graph(),
        }
        const origins = EvenPointSampling.create(width, height, groupScale)
        const groups = this._buildGroups(origins, data)
        const directions = this._buildDirections(groups, data)
        return {...data, groups, directions}
    }

    _buildRegionTileMap(seed, params) {
        const [width, height] = params.get('width', 'height')
        const [scale, chance, growth] = params.get('scale', 'chance', 'growth')
        const data = {width, height, scale, seed, chance, growth}
        return RegionTileMap.fromData(data)
    }

    _buildGroups(origins, data) {
        const groups = new Map()
        const fills = origins.map((origin, id) => {
            const region = data.regionTileMap.getRegion(origin)
            const fillConfig = new RegionGroupFillConfig(id, data)
            return new OrganicFloodFill(region, fillConfig)
        })
        new MultiFill(fills).map(fill => {
            const group = new RegionGroup(
                fill.config.id, fill.origin, fill.config.area
            )
            groups.set(group.id, group)
        })
        return groups
    }

    _buildDirections(groups, data) {
        const directions = new PairMap()
        const matrix = data.regionTileMap.regionMatrix
        groups.forEach(group => {
            data.graph.getEdges(group.id).forEach(neighborId => {
                const neighbor = groups.get(neighborId)
                const sideOrigin = matrix.wrapVector(group.origin, neighbor.origin)
                const angle = Point.angle(group.origin, sideOrigin)
                const direction = Direction.fromAngle(angle)
                directions.set(group.id, neighborId, direction)
            })
        })
        return directions
    }
}


class RegionGroupFillConfig {
    constructor(id, model) {
        this.id = id
        this.model = model
        this.area = 0
        this.chance = model.groupChance
        this.growth = model.groupGrowth
    }

    isEmpty(region) {
        return !this.model.regionToGroup.has(region.id)
    }

    setValue(region) {
        this.model.regionToGroup.set(region.id, this.id)
        this.area += region.area
    }

    checkNeighbor(neighborRegion, region) {
        if (this.isEmpty(neighborRegion)) return
        const neighborGroupId = this.model.regionToGroup.get(neighborRegion.id)
        if (neighborGroupId === this.id) return
        this.model.borderRegions.add(region.id)
        this.model.graph.setEdge(this.id, neighborGroupId)
    }

    getNeighbors(region) {
        return this.model.regionTileMap.getNeighborRegions(region)
    }
}
