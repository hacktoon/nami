import { Random } from '/src/lib/random'


export class ConcurrentFill {
    constructor(origins, context={}) {
        this.origins = origins
        this.context = context
        this.seedTable = []
        this.levelTable = []
        this.canGrow = true

        for(let fillId = 0; fillId < this.origins.length; fillId ++) {
            const fill = {id: fillId, context: context}
            const origin = this.origins[fillId]
            this.levelTable.push(0)
            this.seedTable.push([origin])
            this.setValue(fill, origin, 0)
        }
        while(this.canGrow) {
            this.#runSteps()
        }
    }

    #runSteps() {
        let completedFills = 0

        for(let fillId = 0; fillId < this.origins.length; fillId ++) {
            const fill = {id: fillId, context: this.context}
            const filledPoints = this.#runStep(fill)
            if (filledPoints.length === 0) {
                completedFills++
            }
        }
        if (completedFills === this.origins.length) {
            // completedFills = 0  // reset to start new phase
            this.canGrow = false
        }
    }

    // methods for each concurrent fill

    #runStep(fill) {
        const seeds = this._growSeeds(fill, this.seedTable[fill.id])
        this.seedTable[fill.id] = seeds
        this._growRandomLayers(fill)
        return seeds
    }

    _growSeeds(fill, seeds) {
        let newSeeds = []
        if (newSeeds.length >= 0) {
            this.levelTable[fill.id] += 1
        }
        for(let seed of seeds) {
            const filledNeighbors = this._fillNeighbors(fill, seed)
            newSeeds.push(...filledNeighbors)
        }
        return newSeeds
    }

    _fillNeighbors(fill, origin) {
        const filledNeighbors = []
        const allNeighbors = this.getNeighbors(fill, origin)
        const emptyNeighbors = allNeighbors.filter(neighbor => {
            this.checkNeighbor(fill, neighbor, origin)
            return this.isEmpty(fill, neighbor)
        })
        emptyNeighbors.forEach(neighbor => {
            filledNeighbors.push(neighbor)
            this.setValue(fill, neighbor, this.levelTable[fill.id])
        })
        return filledNeighbors
    }

    _growRandomLayers(fill) {
        const growth = this.getGrowth(fill)
        for(let i = 0; i < growth; i++) {
            const seeds = this.seedTable[fill.id]
            const [extra, other] = this._splitSeeds(fill, seeds)
            let extraSeeds = this._growSeeds(fill, extra)
            this.seedTable[fill.id] = other.concat(extraSeeds)
        }
    }

    _splitSeeds(fill, seeds) {
        const first = [], second = []
        const chance = this.getChance(fill)
        for(let seed of seeds) {
            const outputArray = Random.chance(chance) ? first : second
            outputArray.push(seed)
        }
        return [first, second]
    }

    // EXTENSIBLE METHODS ==========================

    setValue(fill, origin, level) { }
    isEmpty(fill, origin) { return [] }
    getNeighbors(fill, origin) { return [] }
    checkNeighbor(fill, neighbor, origin) { }
    getChance(fill) { return 0 }
    getGrowth(fill) { return 0 }
}