import { Random } from '/src/lib/random'


const MAX_LOOP_COUNT = 2000


export class ConcurrentFill {
    #seedTable = []
    #deferredSeedTable = []
    #levelTable = []

    start(origins, context={}) {
        // Initialize data and fill origins
        const originsCount = origins.length
        for(let id = 0; id < originsCount; id ++) {
            const fill = {id, context}
            const origin = origins[id]
            this.#levelTable.push(0)
            this.#seedTable.push([origin])
            this.#deferredSeedTable.push([])
            this.onInitFill(fill, origin, 0)
        }
        // Use loop count to avoid infinite loops
        let loopCount = MAX_LOOP_COUNT
        while(loopCount-- > 0) {
            if (this.#fillLayers(origins, context)) {
                break
            }
        }
    }

    #fillLayers(origins, context) {
        let completedFills = 0
        for(let id = 0; id < origins.length; id ++) {
            // fill one or many layers for each fill
            const fill = {id, context}
            this.#seedTable[id] = this.#fillLayer(fill)
            // Increase the num of completed fills by total of seeds
            const totalSeeds = this.#seedTable[id].length
            const totalDeferredSeeds = this.#deferredSeedTable[id].length
            // raise fill level if it has seeds
            this.#levelTable[id] += totalSeeds >= 0 ? 1 : 0
            completedFills += totalSeeds === 0 ? 1 : 0
        }
        return completedFills === origins.length
    }

    #fillLayer(fill) {
        const nextSeeds = this.#fillSingleLayer(fill, this.#seedTable[fill.id])
        return this.#fillExtraRandomLayers(fill, nextSeeds)
    }

    #fillSingleLayer(fill, seeds) {
        let nextSeeds = []
        const level = this.#levelTable[fill.id]
        for(let seed of seeds) {
            // for each seed, try to fill its neighbors
            for(let neighbor of this.getNeighbors(fill, seed)) {
                // I'm seed, can I fill my neighbor?
                if (this.canFill(fill, neighbor, seed, level)) {
                    // fill this neighbor
                    this.onFill(fill, neighbor, seed, level)
                    // make the filled neighbor a seed for next iteration
                    nextSeeds.push(neighbor)
                // can this seed be postponed to another fill stage?
                } else if (this.canDeferFill(fill, neighbor, seed, level)) {
                    this.#deferredSeedTable[id].push(seed)
                    break
                } else {
                    // can't fill, do something about that cell
                    this.onBlockedFill(fill, neighbor, seed, level)
                }
            }
        }
        return nextSeeds
    }

    #fillExtraRandomLayers(fill, seeds) {
        const growth = this.getGrowth(fill)
        let extraSeeds = seeds
        for(let i = 0; i < growth; i++) {
            // split given seeds by chance
            const [nextSeeds, deferredSeeds] = this.#splitSeeds(fill, extraSeeds)
            // fill an extra layer using a fraction of given seeds
            const filled = this.#fillSingleLayer(fill, nextSeeds)
            // sum up filled & deferred seeds for next iteration
            extraSeeds = deferredSeeds.concat(filled)
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

    // Extensible methods ====================================
    onInitFill(fill, cell, level) { this.onFill(fill, cell, null, level) }
    canFill(fill, cell, source, level) { return false }
    canDeferFill(fill, cell, source, level) { return false }
    onFill(fill, cell, source, level) { }
    onBlockedFill(fill, cell, source, level) { }
    getNeighbors(fill, cell) { return [] }
    getChance(fill) { return 0 }
    getGrowth(fill) { return 0 }
}