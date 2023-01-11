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
            const fill = {id, context, level: 0}
            const origin = origins[id]
            this.#levelTable.push(0)
            this.#seedTable.push([origin])
            this.#deferredSeedTable.push([])
            this.onInitFill(fill, origin)
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
        let deferredSeeds = 0
        for(let id = 0; id < origins.length; id ++) {
            // fill one or many layers for each id
            const fill = {id, context, level: this.#levelTable[id]}
            const nextSeeds = this.#fillLayer(fill)
            // Increase number of completed fills if it has no seeds
            completedFills += nextSeeds.length === 0 ? 1 : 0
            // raise fill level if it has more seeds to spread
            this.#levelTable[id] += nextSeeds.length >= 0 ? 1 : 0
            // set seeds for next layer
            this.#seedTable[id] = nextSeeds
        }
        return completedFills === origins.length
    }

    #fillLayer(fill) {
        const nextSeeds = this.#fillSingleLayer(fill, this.#seedTable[fill.id])
        this.#fillExtraRandomLayers(fill, nextSeeds)
    }

    #fillSingleLayer(fill, seeds) {
        let nextSeeds = []
        for(let source of seeds) {
            // for each seed, try to fill its neighbors
            for(let target of this.getNeighbors(fill, source)) {
                // I'm seed, can I fill my neighbor?
                if (this.canFill(fill, target, source)) {
                    // fill this neighbor
                    this.onFill(fill, target, source)
                    // make the filled neighbor a seed for next iteration
                    nextSeeds.push(target)
                } else {
                    // can't fill, do something about that cell
                    this.onBlockedFill(fill, target, source)
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
            const [nextSeeds, cachedSeeds] = this.#splitSeeds(fill, extraSeeds)
            // fill an extra layer using a fraction of given seeds
            const filled = this.#fillSingleLayer(fill, nextSeeds)
            // sum up filled & deferred seeds for next iteration
            extraSeeds = cachedSeeds.concat(filled)
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
    onInitFill(fill, target) { this.onFill(fill, target, null) }
    canFill(fill, target, source) { return false }
    onFill(fill, target, source) { }
    onBlockedFill(fill, target, source) { }
    getNeighbors(fill, target) { return [] }
    getChance(fill) { return 0 }
    getGrowth(fill) { return 0 }
}