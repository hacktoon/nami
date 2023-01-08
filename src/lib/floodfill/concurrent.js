import { Random } from '/src/lib/random'


const MAX_LOOP_COUNT = 2000


export class ConcurrentFill {
    #seedTable = []
    #levelTable = []

    constructor(origins, context={}) {
        this.origins = origins
        this.context = context

        // Initialize data and fill origins
        for(let fillId = 0; fillId < this.origins.length; fillId ++) {
            const fill = {id: fillId, context: context}
            const origin = this.origins[fillId]
            this.#levelTable.push(0)
            this.#seedTable.push([origin])
            this.onFill(fill, origin, null, 0)
        }
        // Use loop count to avoid infinite loops
        let loopCount = MAX_LOOP_COUNT
        while(this.#executeFills() && loopCount > 0) {
            loopCount--
        }
    }

    // Extensible methods ====================================
    onFill(fill, cell, source, level) { }
    onBlockedFill(fill, cell, source, level) { }
    canFill(fill, cell, source, level) { return false }
    getNeighbors(fill, cell) { return [] }
    getChance(fill) { return 0 }
    getGrowth(fill) { return 0 }

    // Private methods =======================================
    #executeFills() {
        let completedFills = 0
        for(let fillId = 0; fillId < this.origins.length; fillId ++) {
            const fill = {id: fillId, context: this.context}
            const nextSeeds = this.#fillLayer(fill, this.#seedTable[fill.id])
            this.#seedTable[fill.id] = this.#fillRandomLayers(fill, nextSeeds)
            // Increase the num of completed fills by total of seeds
            completedFills += this.#seedTable[fill.id].length === 0 ? 1 : 0
        }
        // are all fills complete?
        return completedFills < this.origins.length
    }

    #fillLayer(fill, seeds) {
        let nextSeeds = []
        if (nextSeeds.length >= 0) {
            this.#levelTable[fill.id] += 1
        }
        for(let seed of seeds) {
            const filled = this.#fillSeedNeighbors(fill, seed)
            nextSeeds.push(...filled)
        }
        return nextSeeds
    }

    #fillSeedNeighbors(fill, source) {
        const nextSeeds = []
        const neighbors = this.getNeighbors(fill, source)
        const level = this.#levelTable[fill.id]
        for(let neighbor of neighbors) {
            if (this.canFill(fill, neighbor, source, level)) {
                // do something to fill that cell
                this.onFill(fill, neighbor, source, level)
                // make it a seed for next iteration
                nextSeeds.push(neighbor)
            } else {
                // can't fill, do something about that blocked cell
                this.onBlockedFill(fill, neighbor, source, level)
            }
        }
        return nextSeeds
    }

    #fillRandomLayers(fill, seeds) {
        const growth = this.getGrowth(fill)
        let extraSeeds = seeds
        for(let i = 0; i < growth; i++) {
            // split given seeds by chance
            const [nextSeeds, deferredSeeds] = this.#splitSeeds(fill, extraSeeds)
            // fill an extra layer using a fraction of given seeds
            let newExtraSeeds = this.#fillLayer(fill, nextSeeds)
            // sum up extra & deferred seeds for next iteration
            extraSeeds = deferredSeeds.concat(newExtraSeeds)
        }
        return extraSeeds
    }

    #splitSeeds(fill, seeds) {
        const first = [], second = []
        const chance = this.getChance(fill)
        for(let seed of seeds) {
            const outputArray = Random.chance(chance) ? first : second
            outputArray.push(seed)
        }
        return [first, second]
    }
}