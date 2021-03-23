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
    constructor(refs, params) {
        this.chance = params.get('chance')
        this.growth = params.get('growth')
        this.regionMap = refs.regionMap
        this.regionToGroup = refs.regionToGroup
        this.currentGroup = refs.group
        this.graph = refs.graph
    }

    isEmpty(region) {
        return this.regionToGroup.get(region.id) === undefined
    }

    setValue(region) {
        this.regionToGroup.set(region.id, this.currentGroup)
        this.currentGroup.area += region.area
    }

    checkNeighbor(neighborRegion) {
        const currentGroup = this.currentGroup
        if (this.isEmpty(neighborRegion)) return
        const neighborGroup = this.regionToGroup.get(neighborRegion.id)
        if (neighborGroup.id === currentGroup.id) return
        this.graph.setEdge(currentGroup.id, neighborGroup.id)
    }

    getNeighbors(region) {
        return this.regionMap.getNeighbors(region)
    }
}