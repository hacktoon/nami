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
        const regionTileMap = _buildRegionTileMap(seed, params)

        this.regionTileMap = regionTileMap
        this.regionToGroup = new Map()
        this.borderRegions = new Set()
        this.groups = new Map()

        const graph = new Graph()
        const origins = _buildOrigins(params)
        const fills = origins.map((origin, id) => {
            const region = regionTileMap.getRegion(origin)
            const group = new RegionGroup(id, region)
            const fillConfig = new RegionGroupFillConfig(id, {
                groupChance: params.get('groupChance'),
                groupGrowth: params.get('groupGrowth'),
                graph,
                model: this,
                group,
            })
            return new OrganicFloodFill(region, fillConfig)
        })
        new MultiFill(fills).forEach(fill => {
            const group = new RegionGroup(fill.config.id, fill.origin)
            this.groups.set(group.id, group)
        })
    }

    setGroup(region, group) {
        this.regionToGroup.set(region.id, group)
    }

    setBorder(region) {  //TODO: remove
        this.borderRegions.add(region.id)
    }

    getRegion(point) {
        return this.regionTileMap.getRegion(point)
    }

    getGroup(region) {
        return this.regionToGroup.get(region.id)
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
            if (group.id !== borderGroup.id)
                return true
        }
        return false
    }

    isRegionEmpty(region) {
        return ! this.regionToGroup.has(region.id)
    }

    map(callback) {
        const groups = Array.from(this.groups.values())
        return groups.map(callback)
    }

    forEach(callback) {
        this.groups.forEach(callback)
    }
}


function _buildOrigins(params) {
    const [width, height] = params.get('width', 'height')
    const groupScale = params.get('groupScale')
    return EvenPointSampling.create(width, height, groupScale)
}


function _buildRegionTileMap(seed, params) {
    const [width, height] = params.get('width', 'height')
    const [scale, chance, growth] = params.get('scale', 'chance', 'growth')
    const data = {width, height, scale, seed, chance, growth}
    return RegionTileMap.fromData(data)
}




class RegionGroupFillConfig {
    constructor(id, model) {
        this.id = id
        this.chance = model.groupChance
        this.growth = model.groupGrowth

        this.group = model.group
        this.model = model.model
        this.graph = model.graph
    }

    isEmpty(region) {
        return this.model.isRegionEmpty(region)
    }

    setValue(region) {
        this.model.setGroup(region, this.group)
        this.group.area += region.area
    }

    checkNeighbor(neighborRegion, region) {
        const currentGroup = this.group
        const neighborGroup = this.model.getGroup(neighborRegion)
        if (this.isEmpty(neighborRegion)) return
        if (neighborGroup.id === currentGroup.id) return
        this.model.setBorder(region)
        this.graph.setEdge(currentGroup.id, neighborGroup.id)
    }

    getNeighbors(region) {
        return this.model.regionTileMap.getNeighborRegions(region)
    }
}
