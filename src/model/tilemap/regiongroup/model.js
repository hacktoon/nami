import { Color } from '/lib/base/color'


export class RegionGroup {
    constructor(id, region) {
        this.id = id
        this.origin = region.origin
        this.color = new Color()
        this.area = 0
    }
}


export class RegionGroupData {
    constructor(regionTileMap) {
        this.regionTileMap = regionTileMap
        this.regionToGroup = new Map()
        this.borderRegions = new Set()
        this.regionLayerMap = new Map()
        this.index = new Map()
        this.layers = []
    }

    get groups() {
        return Array.from(this.index.values())
    }

    setGroup(region, group) {
        this.index.set(group.id, group)
        this.regionToGroup.set(region.id, group)
    }

    setBorder(region) {
        this.borderRegions.add(region.id)
    }

    setRegionLayer(region, layer) {
        this.regionLayerMap.set(region.id, layer)
        this.layers.push(layer)
    }

    hasRegionLayer(region) {
        return this.regionLayerMap.has(region.id)
    }

    getRegion(point) {
        return this.regionTileMap.getRegion(point)
    }

    getRegionLayer(region) {
        return this.regionLayerMap.get(region.id)
    }

    getGroup(region) {
        return this.regionToGroup.get(region.id)
    }

    getRegionsAtBorders() {
        const ids = Array.from(this.borderRegions.values())
        return ids.map(id => this.regionTileMap.getRegionById(id))
    }

    getBorderRegionsAt(point) {
        return this.regionTileMap.getBorderRegionsAt(point)
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
        const entries = Array.from(this.index.values())
        return entries.map(callback)
    }

    forEach(callback) {
        this.index.forEach(callback)
    }
}


export class RegionGroupFillConfig {
    constructor(params) {
        this.chance = params.groupChance
        this.growth = params.groupGrowth

        this.currentGroup = params.group
        this.data = params.data
        this.graph = params.graph
    }

    isEmpty(region) {
        return this.data.isRegionEmpty(region)
    }

    setValue(region) {
        this.data.setGroup(region, this.currentGroup)
        this.currentGroup.area += region.area
    }

    checkNeighbor(neighborRegion, region) {
        const currentGroup = this.currentGroup
        const neighborGroup = this.data.getGroup(neighborRegion)
        if (this.isEmpty(neighborRegion)) return
        if (neighborGroup.id === currentGroup.id) return
        this.data.setBorder(region)
        this.graph.setEdge(currentGroup.id, neighborGroup.id)
    }

    getNeighbors(region) {
        return this.data.regionTileMap.getNeighborRegions(region)
    }
}


export class RegionLayerFillConfig {
    constructor(params) {
        this.chance = params.chance
        this.growth = params.growth
        this.currentRegion = params.region
        this.data = params.data
    }

    isEmpty(region) {
        return ! this.data.hasRegionLayer(region)
    }

    setValue(region, layer) {
        this.data.setRegionLayer(region, layer)
    }

    checkNeighbor() {}

    getNeighbors(region) {
        return this.data.regionTileMap.getNeighborRegions(region)
    }
}
