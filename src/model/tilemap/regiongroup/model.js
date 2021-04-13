import { Color } from '/lib/base/color'


export class RegionGroup {
    constructor(id, region) {
        this.id = id
        this.origin = region.origin
        this.color = new Color()
        this.area = 0
    }
}


export class RegionGroupTable {
    constructor(regionTileMap) {
        this.regionTileMap = regionTileMap
        this.regionToGroup = new Map()
        this.borderRegions = new Set()
        this.regionLayerMap = new Map()
        this.borderRegionLayerMap = new Map()
        this.index = new Map()
        this.layers = []
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
    }

    setBorderRegionLayer(region, layer) {
        this.borderRegionLayerMap.set(region.id, layer)
        this.layers.push(layer)
    }

    hasBorderRegionLayer(region) {
        return this.borderRegionLayerMap.has(region.id)
    }

    getRegion(point) {
        return this.regionTileMap.getRegion(point)
    }

    getRegionLayer(region) {
        return this.regionLayerMap.get(region.id)
    }

    getGroupLayer(region) {
        return this.borderRegionLayerMap.get(region.id)
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
        this.table = params.table
        this.graph = params.graph
    }

    isEmpty(region) {
        return this.table.isRegionEmpty(region)
    }

    setValue(region, level) {
        this.table.setGroup(region, this.currentGroup)
        this.table.setRegionLayer(region, level)
        this.currentGroup.area += region.area
    }

    checkNeighbor(neighborRegion, region) {
        const currentGroup = this.currentGroup
        const neighborGroup = this.table.getGroup(neighborRegion)
        if (this.isEmpty(neighborRegion)) return
        if (neighborGroup.id === currentGroup.id) return
        this.table.setBorder(region)
        this.graph.setEdge(currentGroup.id, neighborGroup.id)
    }

    getNeighbors(region) {
        return this.table.regionTileMap.getNeighborRegions(region)
    }
}


export class RegionLayerFillConfig {
    constructor(params) {
        this.currentRegion = params.region
        this.table = params.table
    }

    isEmpty(region) {
        return ! this.table.hasBorderRegionLayer(region)
    }

    setValue(region, layer) {
        this.table.setBorderRegionLayer(region, layer)
    }

    checkNeighbor() {}

    getNeighbors(region) {
        return this.table.regionTileMap.getNeighborRegions(region)
    }
}
