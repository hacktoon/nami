

class Group {
    constructor(id) {
        this.id = id
    }
}


export class GroupMap {
    constructor(regionMap, groupOrigins) {
        this.regionToGroup = new Map()
        let seedRegions = groupOrigins.map((point, groupIndex) => {
            const region = regionMap.getRegion(point)
            this.regionToGroup.set(region.id, groupIndex)
            return [region, groupIndex]
        })

        const grow = () => {
            let nextSeeds = []
            seedRegions.forEach(([region, groupId]) => {
                const allNeighbors = regionMap.getNeighbors(region)
                allNeighbors.forEach(neighbor => {
                    if (this.regionToGroup.has(neighbor.id)) return
                    this.regionToGroup.set(neighbor.id, groupId)
                    nextSeeds.push([neighbor, groupId])
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
