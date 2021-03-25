import { Color } from '/lib/base/color'


const NO_GROUP = null


export class Group {
    constructor(id, origin) {
        this.id = id
        this.origin = origin
        this.color = new Color()
        this.area = 0
    }
}


export class RegionGroupTable {
    constructor(regionMap) {
        this.regionMap = regionMap
        this.regionToGroup = new Map()
        this.borderRegions = new Set()
        this.index = new Map()
    }

    setGroup(region, group) {
        this.index.set(group.id, group)
        this.regionToGroup.set(region.id, group)
    }

    getRegion(point) {
        return this.regionMap.getRegion(point)
    }

    getGroup(region) {
        return this.regionToGroup.get(region.id)
    }

    getRegion(point) {
        return this.regionMap.getRegion(point)
    }

    getBorderRegions(point) {
        return this.regionMap.getBorderRegions(point)
    }

    setBorder(region) {
        this.borderRegions.add(region.id)
    }

    isRegionBorder(point) {
        return this.regionMap.isBorder(point)
    }

    isGroupBorder(group, borderRegions) {
        for(let region of borderRegions) {
            const borderGroup = this.getGroup(region)
            if (! this.isSameGroup(group, borderGroup))
                return true
        }
        return false
    }

    isSameGroup(group, other) {
        return group.id === other.id
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


export class GroupFillConfig {
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

    setValue(region) {
        this.table.setGroup(region, this.currentGroup)
        this.currentGroup.area += region.area
    }

    checkNeighbor(neighborRegion, region) {
        const currentGroup = this.currentGroup
        if (this.isEmpty(neighborRegion)) return
        const neighborGroup = this.table.getGroup(neighborRegion)
        if (neighborGroup.id === currentGroup.id) return
        this.table.setBorder(region)
        this.graph.setEdge(currentGroup.id, neighborGroup.id)
    }

    getNeighbors(region) {
        return this.table.regionMap.getNeighbors(region)
    }
}
