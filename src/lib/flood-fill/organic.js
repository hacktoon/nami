import { Random } from '/lib/random'


export class OrganicFill {
    constructor(originPoint, hooks={}) {
        this.layer = 0
        this.origin = originPoint
        this.seeds = [originPoint]
        this.setOrigin = hooks.setOrigin ?? (()=>{})
        this.setValue = hooks.setValue ?? (()=>{})
        this.setSeed = hooks.setSeed ?? (()=>{})
        this.setLayer = hooks.setLayer ?? (()=>{})
        this.setBorder = hooks.setBorder ?? (()=>{})
        this.isSeed = hooks.isSeed ?? (() => true)
        this.isEmpty = hooks.isEmpty ?? (() => false)
        this.isBlocked = hooks.isBlocked ?? (() => true)
        this.growthChance = hooks.growthChance ?? 1
        this.layerGrowth = hooks.layerGrowth ?? 1

        this.setOrigin(originPoint)
        this.setSeed(originPoint)
    }

    fill() {
        if (this.seeds.length == 0)
            return []
        const filled = this.#fillValues(this.seeds)
        const seeds = this.#setSeeds(filled)
        this.seeds = this.#setExtraSeeds(seeds)
        this.layer++
        return filled
    }

    #fillValues(seedPoints) {
        return seedPoints.filter(point => {
            if (! this.isEmpty(point)) return false
            this.setValue(point)
            this.setLayer(point, this.layer)
            return true
        })
    }

    #setSeeds(points) {
        let seeds = []
        points.forEach(point => {
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
        })
        return seeds
    }

    #isSeedable(point) {
        return this.isEmpty(point) && !this.isSeed(point)
    }

    #setExtraSeeds(seeds) {
        let times_remaining = Random.int(this.layerGrowth)
        const randFilter = () => Random.chance(this.growthChance)
        while(seeds.length && times_remaining--) {
            const randPoints = seeds.filter(randFilter)
            seeds.push(...this.#setSeeds(randPoints))
        }
        return seeds
    }
}