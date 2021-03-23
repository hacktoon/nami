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

    add(group) {
        this.index.set(group.id, group)
    }

    set(region, group) {
        this.regionToGroup.set(region.id, group)
    }

    get(region) {
        return this.regionToGroup.get(region.id)
    }

    setBorder(region) {
        this.borderRegions.add(region.id)
    }

    getGroups() {
        return Array.from(this.index.values())
    }

    isRegionEmpty(region) {
        return ! this.regionToGroup.has(region.id)
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
        this.table.set(region, this.currentGroup)
        this.currentGroup.area += region.area
    }

    checkNeighbor(neighborRegion, region) {
        const currentGroup = this.currentGroup
        if (this.isEmpty(neighborRegion)) return
        const neighborGroup = this.table.get(neighborRegion)
        if (neighborGroup.id === currentGroup.id) return
        this.table.setBorder(region)
        this.graph.setEdge(currentGroup.id, neighborGroup.id)
    }

    getNeighbors(region) {
        return this.table.regionMap.getNeighbors(region)
    }
}
