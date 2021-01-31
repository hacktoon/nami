import { Random } from '/lib/random'


export class OrganicFill {
    constructor(origin, params) {
        this.layer = 0
        this.origin = origin
        this.seeds = [origin]
        this.setOrigin = params.setOrigin
        this.setValue = params.setValue
        this.setSeed = params.setSeed
        this.setLayer = params.setLayer
        this.setBorder = params.setBorder
        this.isSeed = params.isSeed
        this.isEmpty = params.isEmpty
        this.isBlocked = params.isBlocked
        this.growthChance = params.growthChance ?? 1
        this.layerGrowth = params.layerGrowth ?? 1

        this.setOrigin(origin)
        this.setSeed(origin)
    }

    fill() {
        if (this.seeds.length == 0)
            return []
        const filled = this.#fillValues(this.seeds)
        const seeds = this.#buildSeeds(filled)
        this.seeds = this.#buildExtraSeeds(seeds)
        this.layer++
        return filled
    }

    #fillValues(seedPoints) {
        return seedPoints.filter(point => {
            if (this.isEmpty(point)) {
                this.setValue(point)
                this.setLayer(point, this.layer)
                return true
            }
            return false
        })
    }

    #buildSeeds(points) {
        let seeds = []
        const visitNeighbors = point => {
            point.adjacents(neighbor => {
                if (this.isBlocked(neighbor)) {
                    this.setBorder(point, neighbor)
                    return
                }
                if (this.#isSeedable(neighbor)) {
                    this.setSeed(neighbor)
                    seeds.push(neighbor)
                }
            })
        }
        points.forEach(visitNeighbors)
        return seeds
    }

    #isSeedable(point) {
        return this.isEmpty(point) && !this.isSeed(point)
    }

    #buildExtraSeeds(seeds) {
        let times_remaining = Random.int(this.layerGrowth)
        const randFilter = () => Random.chance(this.growthChance)
        while(seeds.length && times_remaining--) {
            const randPoints = seeds.filter(randFilter)
            seeds.push(...this.#buildSeeds(randPoints))
        }
        return seeds
    }
}