import { Color } from '/lib/base/color'


export class Group {
    constructor(id, origin) {
        this.id = id
        this.origin = origin
        this.area = 0
        this.color = new Color()
    }
}


export class GroupFillConfig {
    constructor(params) {
        this.borderRegions = params.borderRegions
        this.regionToGroup = params.regionToGroup
        this.regionMap = params.regionMap
        this.currentGroup = params.group
        this.chance = params.groupChance
        this.growth = params.groupGrowth
        this.graph = params.graph
    }

    isEmpty(region) {
        return this.regionToGroup.get(region.id) === undefined
    }

    setValue(region) {
        this.regionToGroup.set(region.id, this.currentGroup)
        this.currentGroup.area += region.area
    }

    checkNeighbor(neighborRegion, region) {
        const currentGroup = this.currentGroup
        if (this.isEmpty(neighborRegion)) return
        const neighborGroup = this.regionToGroup.get(neighborRegion.id)
        if (neighborGroup.id === currentGroup.id) return
        this.borderRegions.set(region.id, currentGroup.id)
        this.graph.setEdge(currentGroup.id, neighborGroup.id)
    }

    getNeighbors(region) {
        return this.regionMap.getNeighbors(region)
    }
}