

export class Group {
    constructor(id) {
        this.id = id
    }
}


export class GroupMap {
    constructor(regionMap, groupOrigins) {
        this.regionToGroup = new Map()
        let seedRegions = groupOrigins.map((point, index) => {
            const group = new Group(index)
            const region = regionMap.getRegion(point)
            this.regionToGroup.set(region.id, group)
            return [region, group]
        })

        const grow = () => {
            let nextSeeds = []
            seedRegions.forEach(([region, group]) => {
                const allNeighbors = regionMap.getNeighbors(region)
                allNeighbors.forEach(neighbor => {
                    if (this.regionToGroup.has(neighbor.id)) return
                    this.regionToGroup.set(neighbor.id, group)
                    nextSeeds.push([neighbor, group])
                })
            })
            return nextSeeds
        }

        while (seedRegions.length > 0) {
            seedRegions = grow()
        }
    }

    get(region) {
        return this.regionToGroup.get(region.id)
    }

    forEach(callback) {
        this.regionToGroup.forEach(callback)
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
        this.regionToGroup.set(region, this.currentGroup.id)
        this.currentGroup.area += 1
    }

    checkNeighbor(neighborRegion) {
        const currentGroup = this.currentGroup
        if (this.isEmpty(neighborRegion)) return
        const neighborGroup = this.regionToGroup.get(neighborRegion)
        if (neighborGroup.id === currentGroup.id) return
        this.graph.setEdge(currentGroup.id, neighborGroup.id)
    }

    getNeighbors(region) {
        return this.regionMap.getNeighbors(region)
    }
}