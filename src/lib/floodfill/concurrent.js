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
            this.setValue(fill, origin, 0)
        }
        // Use loop count to avoid infinite loops
        let loopCount = MAX_LOOP_COUNT
        while(this.#executeFills() && loopCount > 0) {
            loopCount--
        }
    }

    // Extensible methods ====================================
    setValue(fill, origin, level) { }
    isEmpty(fill, origin) { return [] }
    getNeighbors(fill, origin) { return [] }
    checkNeighbor(fill, neighbor, origin) { }
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
            completedFills += nextSeeds.length === 0 ? 1 : 0
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

    #fillSeedNeighbors(fill, center) {
        const nextSeeds = []
        const neighbors = this.getNeighbors(fill, center)
        for(let neighbor of neighbors) {
            this.checkNeighbor(fill, neighbor, center)
            if (this.isEmpty(fill, neighbor)) {
                const level = this.#levelTable[fill.id]
                this.setValue(fill, neighbor, level)
                nextSeeds.push(neighbor)
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