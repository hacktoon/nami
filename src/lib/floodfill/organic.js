import { Random } from '/lib/random'
import { FloodFill } from './index'


export class OrganicFloodFill extends FloodFill {
    constructor(origin, params) {
        super(origin, params)
        this.iterations = params.iterations ?? 20
        this.chance = params.chance ?? .2
    }

    grow() {
        this.seeds = this.growLayer()
        this.growMore()
        return this.seeds
    }

    growMore() {
        if (Random.chance(this.chance)) return
        for(let i = 0; i < this.iterations; i++) {
            this.growRandomLayer()
        }
    }

    growRandomLayer() {
        const [extra, other] = this.splitSeeds(this.seeds)
        let extraSeeds = this.growLayer(extra)
        this.seeds = [...other, ...extraSeeds]
    }

    splitSeeds(array) {
        const first = [], second = []
        for(let i = 0; i < array.length; i++) {
            const outputArray = Random.chance(this.chance) ? first : second
            outputArray.push(array[i])
        }
        return [first, second]
    }
}


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
        this.isNeighbor = params.isNeighbor
        this.growthChance = params.growthChance ?? 1
        this.layerGrowth = params.layerGrowth ?? 1

        this.setOrigin(origin)
        this.setSeed(origin)
    }

    grow() {
        if (this.seeds.length == 0)
            return []
        const filled = this.#fillValues(this.seeds)
        this.seeds = this.#buildSeeds(filled)
        this.seeds = this.#buildExtraSeeds(this.seeds)
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
                if (this.isNeighbor(neighbor)) {
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