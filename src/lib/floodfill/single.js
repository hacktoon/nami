import { Random } from '/lib/random'


export class SingleFillUnit {
    #area = 0

    constructor(origin, context, growth=0, chance=1) {
        this.origin = origin
        this.context = context
        this.growth = growth
        this.chance = chance
        this.seeds = [origin]
        this.level = 0
        this._fillValue(origin, 0)
    }

    grow() {
        const seeds = this._growSeeds()
        this.seeds = seeds
        this._growRandomLayers()
        return seeds
    }

    growFull() {
        while(this.seeds.length > 0) {
            this.grow()
        }
    }

    _growSeeds() {
        const newSeeds = []
        for(let seed of this.seeds) {
            const filledNeighbors = this._fillNeighbors(seed)
            newSeeds.push(...filledNeighbors)
        }
        if (newSeeds.length >= 0) {
            this.level += 1
        }
        return newSeeds
    }

    _fillValue(cell, level) {
        this.setValue(cell, level)
        this.#area += this.getArea(cell)
    }

    _fillNeighbors(origin) {
        const filledNeighbors = []
        const allNeighbors = this.getNeighbors(origin)
        allNeighbors.filter(neighbor => {
            this.checkNeighbor(neighbor, origin)
            if (this.isEmpty(neighbor)) {
                filledNeighbors.push(neighbor)
                this._fillValue(neighbor, this.level)
            }
        })
        return filledNeighbors
    }

    _growRandomLayers() {
        for(let i = 0; i < this.growth; i++) {
            const [extra, other] = this._splitSeeds(this.seeds)
            let extraSeeds = this._growSeeds(extra)
            this.seeds = other.concat(extraSeeds)
        }
    }

    _splitSeeds(seeds) {
        const first = [], second = []
        for(let seed of seeds) {
            const outputArray = Random.chance(this.chance) ? first : second
            outputArray.push(seed)
        }
        return [first, second]
    }

    getArea(cell) {
        return this.#area
    }

    // EXTENSIBLE METHODS ==========================

    setValue(cell, level) { }

    isEmpty(cell) {
        return []
    }

    getNeighbors(cell) {
        return []
    }

    checkNeighbor(neighbor, origin) { }
}