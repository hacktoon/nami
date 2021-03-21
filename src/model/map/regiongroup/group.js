

class Group {
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
