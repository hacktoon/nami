import { Color } from '/lib/base/color'
import { MultiFill } from '/lib/floodfill'
import { Graph } from '/lib/base/graph'
import { EvenPointSampling } from '/lib/base/point/sampling'
import { OrganicFloodFill } from '/lib/floodfill/organic'

import { RegionTileMap } from '/model/tilemap/region'


class RegionGroup {
    constructor(id, region) {
        this.id = id
        this.origin = region.origin
        this.color = new Color()
        this.area = 0
    }
}


export class RegionGroupModel {
    constructor(seed, params) {
        const data = this._build(seed, params)
        this.regionTileMap = data.regionTileMap
        this.regionToGroup = data.regionToGroup
        this.borderRegions = data.borderRegions
        this.groups = data.groups
        this.graph = data.graph
    }

    _build(seed, params) {
        const [width, height] = params.get('width', 'height')
        const groupScale = params.get('groupScale')
        const regionTileMap = this._buildRegionTileMap(seed, params)
        const data = {
            groupChance: params.get('groupChance'),
            groupGrowth: params.get('groupGrowth'),
            regionToGroup: new Map(),
            borderRegions: new Set(),
            graph: new Graph(),
            regionTileMap,
        }
        const groups = new Map()
        const origins = EvenPointSampling.create(width, height, groupScale)
        const fills = origins.map((origin, id) => {
            const region = regionTileMap.getRegion(origin)
            const fillConfig = new RegionGroupFillConfig(id, data)
            return new OrganicFloodFill(region, fillConfig)
        })

        new MultiFill(fills).forEach(fill => {
            const group = new RegionGroup(fill.config.id, fill.origin)
            groups.set(group.id, group)
        })

        return {...data, groups}
    }

    _buildRegionTileMap(seed, params) {
        const [width, height] = params.get('width', 'height')
        const [scale, chance, growth] = params.get('scale', 'chance', 'growth')
        const data = {width, height, scale, seed, chance, growth}
        return RegionTileMap.fromData(data)
    }

    getRegion(point) {
        return this.regionTileMap.getRegion(point)
    }

    getGroup(region) {
        const id = this.regionToGroup.get(region.id)
        return this.groups.get(id)
    }

    getRegionsAtBorders() {
        const ids = Array.from(this.borderRegions.values())
        return ids.map(id => this.regionTileMap.getRegionById(id))
    }

    getTileBorderRegions(point) {
        return this.regionTileMap.getTileBorderRegions(point)
    }

    hasBorderRegions(region) {
        return this.borderRegions.has(region.id)
    }

    isRegionBorder(point) {
        return this.regionTileMap.isBorder(point)
    }

    isGroupBorder(group, borderRegions) {
        for(let region of borderRegions) {
            const borderGroup = this.getGroup(region)
            if (group.id !== borderGroup.id) return true
        }
        return false
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
        const neighborGroup = this.model.regionToGroup.get(region.id)
        if (this.isEmpty(neighborRegion)) return
        if (neighborGroup.id === this.id) return
        this.model.borderRegions.add(region.id)
        this.model.graph.setEdge(this.id, neighborGroup.id)
    }

    getNeighbors(region) {
        return this.model.regionTileMap.getNeighborRegions(region)
    }
}
