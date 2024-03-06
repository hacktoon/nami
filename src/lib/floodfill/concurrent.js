import { Random } from '/src/lib/random'


const MAX_LOOP_COUNT = 2000


export class ConcurrentFill {
    #seedTable = []
    #growthTable = []  // stores the level of growth on each point
    #levelTable = []   // stores the level of each layer for each point

    start(origins, context={}) {
        // Initialize data and fill origins
        const growth = 0
        const level = 0
        for(let id = 0; id < origins.length; id ++) {
            const fill = {id, context, growth, level}
            const target = origins[id]
            const neighbors = this.getNeighbors(fill, target)
            this.#growthTable.push(growth)
            this.#levelTable.push(level)
            this.#seedTable.push([target])
            this.onInitFill(fill, target, neighbors)
        }
        // Use loop count to avoid infinite loops
        let loopCount = MAX_LOOP_COUNT
        while(loopCount-- > 0) {
            const completedFills = this.#fillStep(origins, context)
            if (completedFills === origins.length) {
                break
            }
        }
    }

    #fillStep(origins, context) {
        let completedFills = 0
        for(let id = 0; id < origins.length; id ++) {
            // fill one or many layers for each id
            const origin = origins[id]
            const growth = this.#growthTable[id]
            const level = this.#levelTable[id]
            const fill = {id, origin, context, growth, level}
            const nextSeeds = this.#fillLayer(fill)
            // Increase number of completed fills if it has no seeds
            completedFills += nextSeeds.length === 0 ? 1 : 0
            // raise fill growth if it has more seeds to spread
            this.#growthTable[id] += nextSeeds.length > 0 ? 1 : 0
            // set seeds for next layer
            this.#seedTable[id] = nextSeeds
        }
        return completedFills
    }

    #fillLayer(fill) {
        const nextSeeds = this.#fillSingleLayer(fill, this.#seedTable[fill.id])
        // update level on fill context
        const newLevelFill = {...fill, level: this.#levelTable[fill.id]}
        return this.#fillExtraRandomLayers(newLevelFill, nextSeeds)
    }

    #fillSingleLayer(fill, seeds) {
        // for each seed, get its neighbors and try to fill
        const nextSeeds = []
        const nextLevel = this.#levelTable[fill.id] + 1
        for(let source of seeds) {
            // for each seed, try to fill its neighbors
            const neighbors = this.getNeighbors(fill, source)
            for(let target of neighbors) {
                // I'm seed, can I fill my neighbor?
                if (this.canFill(fill, target, source, neighbors)) {
                    // update level if can be filled
                    const newLevelFill = {...fill, level: nextLevel}
                    // fill this neighbor
                    this.onFill(newLevelFill, target, source, neighbors)
                    // make the filled neighbor a seed for next iteration
                    nextSeeds.push(target)
                } else {
                    // can't fill, do something about that cell
                    this.onBlockedFill(fill, target, source, neighbors)
                }
            }
        }
        // set new level if has filled seeds
        if (nextSeeds.length > 0) this.#levelTable[fill.id] = nextLevel
        return nextSeeds
    }

    #fillExtraRandomLayers(fill, seeds) {
        const growth = this.getGrowth(fill)
        const chance = this.getChance(fill)
        let extraSeeds = seeds
        for(let i = 0; i < growth; i++) {
            // split given seeds by chance
            const [next, cached] = this.#splitSeeds(fill, extraSeeds, chance)
            // fill an extra layer using a fraction of given seeds
            // update level on fill context
            const newLevelFill = {...fill, level: this.#levelTable[fill.id]}
            const filled = this.#fillSingleLayer(newLevelFill, next)
            // sum up filled & deferred seeds for next iteration
            extraSeeds = cached.concat(filled)
        }
        return extraSeeds
    }

    #splitSeeds(fill, seeds, chance) {
        const first = [], second = []
        for(let seed of seeds) {
            const outputArray = Random.chance(chance) ? first : second
            outputArray.push(seed)
        }
        return [first, second]
    }

    // Extensible methods ====================================
    onInitFill(fill, target, neighbors) {
        this.onFill(fill, target, null, neighbors)
    }
    canFill(fill, target, source, neighbors) { return false }
    onFill(fill, target, source, neighbors) { }
    onBlockedFill(fill, target, source, neighbors) { }
    getNeighbors(fill, target) { return [] }
    getChance(fill) { return 0 }
    getGrowth(fill) { return 0 }
}