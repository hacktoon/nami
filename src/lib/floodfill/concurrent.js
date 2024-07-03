import { Random } from '/src/lib/random'


const MAX_LOOP_COUNT = 2000


export class ConcurrentFill {
    #seedTable = new Map()
    // stores the level of each layer for each point
    #levelTable = new Map()
    // the 'skip' controls how many times a fill should skip after first step
    #skipTable = new Map()

    constructor(originMap, context={}) {
        this.originMap = originMap
        this.context = context

        // Initialize data and fill origins
        const level = 0
        for(let [id, origin] of this.originMap) {
            const fill = {id, origin, level, context}
            const neighbors = this.getNeighbors(fill, origin)
            this.#levelTable.set(id, level)
            this.#seedTable.set(id, [origin])
            this.#skipTable.set(id, this.getSkip(fill))
            // first fill step
            this.onInitFill(fill, origin, neighbors)
        }
    }

    complete() {
        // Use loop count to avoid infinite loops
        let loopCount = MAX_LOOP_COUNT
        while(loopCount-- > 0) {
            const completedFills = this.step()
            if (completedFills === this.originMap.size) {
                break
            }
        }
    }

    step() {
        let completedFills = 0
        for(let [id, origin] of this.originMap) {
            const skipCount = this.#skipTable.get(id)
            if (skipCount > 0) {
                this.#skipTable.set(id, skipCount - 1)
                continue
            }
            // fill one or many layers for each id
            const level = this.#levelTable.get(id)
            const fill = {id, origin, level, context: this.context}
            const nextSeeds = this.#fillLayer(fill)
            // Increase number of completed fills if it has no seeds
            completedFills += nextSeeds.length === 0 ? 1 : 0
            // set seeds for next layer
            this.#seedTable.set(id, nextSeeds)
        }
        return completedFills
    }

    #fillLayer(fill) {
        const seeds = this.#seedTable.get(fill.id)
        const nextSeeds = this.#fillSingleLayer(fill, seeds)
        // update level on fill context
        const level = this.#levelTable.get(fill.id)
        const newLevelFill = {...fill, level}
        return this.#fillExtraRandomLayers(newLevelFill, nextSeeds)
    }

    #fillSingleLayer(fill, seeds) {
        // for each seed, get its neighbors and try to fill
        const nextSeeds = []
        const nextLevel = this.#levelTable.get(fill.id) + 1
        for(let source of seeds) {
            // for each seed, try to fill its neighbors
            const neighbors = this.getNeighbors(fill, source)
            for(let target of neighbors) {
                // I'm a full seed, can I fill my neighbor?
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
        if (nextSeeds.length > 0) {
            this.#levelTable.set(fill.id, nextLevel)
        }
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
            const level = this.#levelTable.get(fill.id)
            const newLevelFill = {...fill, level}
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
    getSkip(fill) { return 0 }
}