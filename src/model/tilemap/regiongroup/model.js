import { Color } from '/lib/base/color'
import { MultiFill } from '/lib/floodfill'
import { Graph } from '/lib/base/graph'
import { EvenPointSampling } from '/lib/base/point/sampling'
import { OrganicFloodFill } from '/lib/floodfill/organic'

import { RegionTileMap } from '/model/tilemap/region'


class RegionGroup {
    constructor(id, region, count) {
        this.id = id
        this.origin = region.origin
        this.color = new Color()
        this.count = count
    }
}


export class RegionGroupModel {
    constructor(seed, params) {
        const data = this._build(seed, params)
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
            groups: new Map(),
        }
        const origins = EvenPointSampling.create(width, height, groupScale)
        const fills = origins.map((origin, id) => {
            const region = data.regionTileMap.getRegion(origin)
            const fillConfig = new RegionGroupFillConfig(id, data)
            return new OrganicFloodFill(region, fillConfig)
        })
        new MultiFill(fills).map(fill => {
            const group = new RegionGroup(fill.config.id, fill.origin, fill.count)
            data.groups.set(group.id, group)
        })
        return data
    }

    _buildRegionTileMap(seed, params) {
        const [width, height] = params.get('width', 'height')
        const [scale, chance, growth] = params.get('scale', 'chance', 'growth')
        const data = {width, height, scale, seed, chance, growth}
        return RegionTileMap.fromData(data)
    }

    map(callback) {
        const groups = Array.from(this.groups.values())
        return groups.map(callback)
    }

    forEach(callback) {
        this.groups.forEach(callback)
    }
}


class RegionGroupFillConfig {
    constructor(id, model) {
        this.id = id
        this.model = model
        this.chance = model.groupChance
        this.growth = model.groupGrowth
    }

    isEmpty(region) {
        return !this.model.regionToGroup.has(region.id)
    }

    setValue(region) {
        this.model.regionToGroup.set(region.id, this.id)
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
