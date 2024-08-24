import { Random } from '/src/lib/random'


const MAX_LOOP_COUNT = 2000


export class ConcurrentFill {
    #seedMap = new Map()
    // stores the level of each layer for each point
    #levelMap = new Map()
    // the 'skip' controls how many times a fill should skip
    // a filling step after starting
    #skipMap = new Map()

    constructor(originMap, context={}) {
        this.originMap = originMap
        this.context = context

        // Initialize data and fill origins
        const level = 0
        for(let [id, origin] of this.originMap) {
            const fill = {id, origin, level, context}
            const neighbors = this.getNeighbors(fill, origin)
            this.#levelMap.set(id, level)
            this.#seedMap.set(id, [origin])
            this.#skipMap.set(id, this.getSkip(fill))
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
            // count skips and decrement when skipped
            const skipCount = this.#skipMap.get(id)
            if (skipCount > 0) {
                this.#skipMap.set(id, skipCount - 1)
                continue
            }
            // fill one or many layers for each id
            const level = this.#levelMap.get(id)
            const fill = {id, origin, level, context: this.context}
            const nextSeeds = this.#fillLayer(fill)
            // Increase number of completed fills if it has no seeds
            completedFills += nextSeeds.length === 0 ? 1 : 0
            // set seeds for next layer
            this.#seedMap.set(id, nextSeeds)
        }
        return completedFills
    }

    #fillLayer(fill) {
        const seeds = this.#seedMap.get(fill.id)
        const nextSeeds = this.#fillSingleLayer(fill, seeds)
        // update level on fill context
        const level = this.#levelMap.get(fill.id)
        const newLevelFill = {...fill, level}
        return this.#fillExtraRandomLayers(newLevelFill, nextSeeds)
    }

    #fillSingleLayer(fill, seeds) {
        // for each seed, get its neighbors and try to fill
        const nextSeeds = []
        const nextLevel = this.#levelMap.get(fill.id) + 1
        for(let source of seeds) {
            // for each seed, try to fill its neighbors
            const neighbors = this.getNeighbors(fill, source)
            for(let target of neighbors) {
                if (! this.isEmpty(fill, target, source)) {
                    continue
                }
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
            this.#levelMap.set(fill.id, nextLevel)
        }
        return nextSeeds
    }

    #fillExtraRandomLayers(fill, seeds) {
        const growth = this.getGrowth(fill)
        let extraSeeds = seeds
        for(let i = 0; i < growth; i++) {
            // split given seeds by chance
            const [next, cached] = this.#splitSeeds(fill, extraSeeds)
            // fill an extra layer using a fraction of given seeds
            // update level on fill context
            const level = this.#levelMap.get(fill.id)
            const newLevelFill = {...fill, level}
            const filled = this.#fillSingleLayer(newLevelFill, next)
            // sum up filled & deferred seeds for next iteration
            extraSeeds = cached.concat(filled)
        }
        return extraSeeds
    }

    #splitSeeds(fill, seeds) {
        const chance = this.getChance(fill)
        const first = [],
              second = []
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
    isEmpty(fill, target, source) { return true }
    canFill(fill, target, source, neighbors) {
        // default is true; method used to delay fill to last phase
        return true
    }
    onFill(fill, target, source, neighbors) { }
    onBlockedFill(fill, target, source, neighbors) { }
    getNeighbors(fill, target) { return [] }
    getChance(fill) { return 0 }
    getGrowth(fill) { return 0 }
    getSkip(fill) { return 0 }
}