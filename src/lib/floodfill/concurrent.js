import { Random } from '/src/lib/random'
import { PointSet } from '/src/lib/geometry/point/set'


const MAX_LOOP_COUNT = 10000


export class ConcurrentFill {
    #rect
    #context
    #fillMap
    #seedMap = new Map()
    #levelMap = new Map()
    #stateMap = new Map()

    constructor(rect, fillMap, context={}) {
        this.#rect = rect
        this.#fillMap = fillMap
        this.#context = context

        // Initialize data and fill origins
        const level = 0
        for(let [id, params] of fillMap) {
            const {origin} = params
            const fill = {...params, id, level, context}
            const neighbors = this.getNeighbors(fill, origin)
            this.#levelMap.set(id, level)
            this.#seedMap.set(id, [origin])
            // first fill step
            this.onInitFill(fill, origin, neighbors)
        }
    }

    step() {
        this.#step()
    }

    complete() {
        // Use loop count to avoid infinite loops
        let loopCount = MAX_LOOP_COUNT
        while(loopCount-- > 0) {
            const completedFills = this.#step(this.#fillMap)
            if (completedFills === this.#fillMap.size) {
                break
            }
        }
    }

    #step() {
        // fill one or many layers for each fill
        let completedFills = 0
        for(let [id, params] of this.#fillMap) {
            const level = this.#levelMap.get(id)
            const seeds = this.#seedMap.get(id)
            const fill = {...params, id, level, context: this.#context}
            const nextSeeds = this.#fillSingleLayer(fill, seeds)
            // Increase number of completed fills if it has no seeds
            if (nextSeeds.length === 0) {
                completedFills++
            } else {
                const extraSeeds = this.#randomFillExtraLayers(fill, nextSeeds)
                // set seeds for next layer
                this.#seedMap.set(id, [...nextSeeds, ...extraSeeds])
            }
        }
        return completedFills
    }

    #fillSingleLayer(fill, seeds) {
        // for each seed, get its neighbors and try to fill
        const nextSeeds = []
        const nextLevel = this.#levelMap.get(fill.id) + 1
        for(let source of seeds) {
            // for each seed, try to fill its neighbors
            const neighbors = this.getNeighbors(fill, source)
            for(let target of neighbors) {
                if (this.isEmpty(fill, target, source)) {
                    // update level if can be filled
                    const newLevelFill = {...fill, level: nextLevel}
                    // fill this neighbor
                    this.onFill(newLevelFill, target, source, neighbors)
                    // make the filled neighbor a seed for next iteration
                    nextSeeds.push(target)
                } else {
                    this.notEmpty(fill, target, source)
                }
            }
        }
        // set new level if has filled seeds
        if (nextSeeds.length > 0) {
            this.#levelMap.set(fill.id, nextLevel)
        }
        return nextSeeds
    }

    #randomFillExtraLayers(fill, seeds) {
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
    notEmpty(fill, target, source) {  }
    onFill(fill, target, source, neighbors) { }
    getNeighbors(fill, target) { return [] }
    getChance(fill) { return 0 }
    getGrowth(fill) { return 0 }
}