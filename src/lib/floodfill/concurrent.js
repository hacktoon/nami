import { Random } from '/src/lib/random'


const MAX_LOOP_COUNT = 10000


export class ConcurrentFill {
    #rect
    #context
    #fillMap
    #seedMap = new Map()
    #levelMap = new Map()

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

    complete() {
        // Use loop count to avoid infinite loops
        let loopCount = MAX_LOOP_COUNT
        const fillMap = this.#fillMap
        const queue = new Set(fillMap.keys())
        while(queue.size > 0 && loopCount-- > 0) {
            for(let [id, params] of fillMap) {
                const fillSeeds = this.#step(id, params)
                if (fillSeeds.length == 0) {
                    queue.delete(id)
                }
            }
        }
    }

    #step(id, params) {
        // fill one or many layers for each fill
        const seeds = this.#seedMap.get(id)
        const level = this.#levelMap.get(id)
        const fill = {...params, id, level, context: this.#context}
        const nextSeeds = this.#fillSingleLayer(fill, seeds)
        const extraSeeds = this.#fillRandomExtraLayers(fill, nextSeeds)
        // set seeds for next layer
        const newSeeds = [...nextSeeds, ...extraSeeds]
        this.#seedMap.set(id, newSeeds)
        return newSeeds
    }

    #fillSingleLayer(fill, seeds) {
        // for each seed, get its neighbors and try to fill
        const nextSeeds = []
        const nextLevel = this.#levelMap.get(fill.id) + 1
        for(let seed of seeds) {
            // for each seed, try to fill its neighbors
            const neighbors = this.getNeighbors(fill, seed)
            for(let target of neighbors) {
                if (this.isEmpty(fill, target, seed)) {
                    // update level if can be filled
                    const newLevelFill = {...fill, level: nextLevel}
                    // fill this neighbor
                    this.onFill(newLevelFill, target, seed, neighbors)
                    // make the filled neighbor a seed for next iteration
                    nextSeeds.push(target)
                } else {
                    this.notEmpty(fill, target, seed)
                }
            }
        }
        // set new level if has filled seeds
        if (nextSeeds.length > 0) {
            this.#levelMap.set(fill.id, nextLevel)
        }
        return nextSeeds
    }

    #fillRandomExtraLayers(fill, seeds) {
        if (seeds.length == 0)
            return []
        const growth = this.getGrowth(fill)
        let extraSeeds = seeds
        for(let i = 0; i < growth; i++) {
            // split given seeds by chance
            const [next, postponed] = this.#splitSeeds(fill, extraSeeds)
            // fill an extra layer using a fraction of given seeds
            const filled = this.#fillSingleLayer(fill, next)
            // sum up filled & deferred seeds for next iteration
            extraSeeds = postponed.concat(filled)
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