import { Random } from '/src/lib/random'


const MAX_LOOP_COUNT = 10000


export class SingleFill {
    #context
    #seeds
    #level

    constructor(origin, context={}) {
        this.#context = context
        this.#seeds = [origin]
        this.#level = 0
        // first fill step
        this.onInitFill(context, origin, this.getNeighbors(context, origin))
    }

    complete() {
        // Use loop count to avoid infinite loops
        let loopCount = MAX_LOOP_COUNT
        while(this.#seeds.length > 0 && loopCount-- > 0) {
            const nextSeeds = this.#fillSingleLayer(this.#seeds)
            const extraSeeds = this.#fillRandomExtraLayers(nextSeeds)
            // set seeds for next layer
            this.#seeds = [...nextSeeds, ...extraSeeds]
        }
    }

    #fillSingleLayer(seeds) {
        // for each seed, get its neighbors and try to fill
        const nextSeeds = []
        const nextLevel = this.#level + 1
        for(let seed of seeds) {
            // for each seed, try to fill its neighbors
            const neighbors = this.getNeighbors(this.#context, seed)
            for(let target of neighbors) {
                if (this.isEmpty(this.#context, target, seed)) {
                    // update level if can be filled
                    // fill this neighbor
                    this.onFill(this.#context, target, seed, neighbors)
                    // make the filled neighbor a seed for next iteration
                    nextSeeds.push(target)
                } else {
                    this.notEmpty(this.#context, target, seed)
                }
            }
        }
        // set new level if has filled seeds
        if (nextSeeds.length > 0) {
            this.#level = nextLevel
        }
        return nextSeeds
    }

    #fillRandomExtraLayers(seeds) {
        if (seeds.length == 0)
            return []
        const growth = this.getGrowth(this.#context)
        let extraSeeds = seeds
        for(let i = 0; i < growth; i++) {
            // split given seeds by chance
            const [next, postponed] = this.#splitSeeds(extraSeeds)
            //  an extra layer using a fraction of given seeds
            const filled = this.#fillSingleLayer(next)
            // sum up filled & deferred seeds for next iteration
            extraSeeds = postponed.concat(filled)
        }
        return extraSeeds
    }

    #splitSeeds(seeds) {
        const chance = this.getChance(this.#context)
        const first = [],
              second = []
        for(let seed of seeds) {
            const outputArray = Random.chance(chance) ? first : second
            outputArray.push(seed)
        }
        return [first, second]
    }

    // Extensible methods ====================================
    onInitFill(context, target, neighbors) {
        this.onFill(context, target, null, neighbors)
    }
    isEmpty(context, target, source) { return true }
    notEmpty(context, target, source) {  }
    onFill(context, target, source, neighbors) { }
    getNeighbors(context, target) { return [] }
    getChance(context) { return 0 }
    getGrowth(context) { return 0 }
}