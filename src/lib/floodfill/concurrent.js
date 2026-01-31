import { Random } from '/src/lib/random'
import { PointSet } from '/src/lib/geometry/point/set'


const MAX_LOOP_COUNT = 10000
const ST_ACTIVE = 1
const ST_PAUSED = 2
const ST_FINISHED = 3


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
            this.#stateMap.set(id, ST_ACTIVE)
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
            let totalPaused = 0
            for(let [id, params] of fillMap) {
                let state = this.#stateMap.get(id)
                if (state == ST_ACTIVE) {
                    const fillSeeds = this.#step(id, params)
                    if (fillSeeds.length == 0) {
                        this.#stateMap.set(id, ST_FINISHED)
                        queue.delete(id)
                    }
                }
                state = this.#stateMap.get(id)
                totalPaused += state == ST_PAUSED ? 1 : 0
            }
            // detect if all remainging are paused
            // if true, restart fill with all active
            // restart fills if remaining are paused
            if (queue.size == totalPaused) {
                console.log(queue);

                for(let id of fillMap.keys()) {
                    this.#stateMap.set(id, ST_ACTIVE)
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
        const state = this.#stateMap.get(fill.id)
        for(let seed of seeds) {
            // check state
            if (state == ST_ACTIVE && this.shouldPause(fill, seed)) {
                this.#stateMap.set(fill.id, ST_PAUSED)
                return seeds
            }
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
    shouldPause(fill, source) { return false }
}