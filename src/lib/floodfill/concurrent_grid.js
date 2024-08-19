import { Grid } from '/src/lib/grid'
import { Random } from '/src/lib/random'


const MAX_LOOP_COUNT = 2000
const EMPTY = null


export class ConcurrentGridFill {
    #rect
    // mark the visited points
    #fillGrid
    #context
    #originMap
    #seedMap = new Map()
    // stores the level of each layer for each point
    #levelMap = new Map()

    constructor(originMap, rect, context={}) {
        this.#fillGrid = Grid.fromRect(rect, () => EMPTY)
        this.#originMap = originMap
        this.#context = context
        this.#rect = rect

        // Initialize data and fill origins
        const level = 0
        for(let [id, origin] of this.#originMap) {
            const fill = {id, origin, level, context}
            const neighbors = this.getNeighbors(fill, origin)
            this.#levelMap.set(id, level)
            this.#seedMap.set(id, [origin])
            this.#fillGrid.set(origin, id)
            // first fill step
            this.onInitFill(fill, origin, neighbors)
        }
    }

    complete() {
        // Use loop count to avoid infinite loops
        let loopCount = MAX_LOOP_COUNT
        while(loopCount-- > 0) {
            const completedFills = this.step()
            if (completedFills === this.#originMap.size) {
                break
            }
        }
        // copy grid
        return Grid.fromRect(this.#rect, point => this.#fillGrid.get(point))
    }

    step() {
        let completedFills = 0
        for(let [id, origin] of this.#originMap) {
            // fill one or many layers for each id
            const level = this.#levelMap.get(id)
            const fill = {id, origin, level, context: this.#context}
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
                // if occupied continue
                if (this.#fillGrid.get(target) !== EMPTY) {
                    continue
                }
                // run conditions for concrete class
                if (this.canFill(fill, target, source, neighbors)) {
                    // update level if can be filled
                    const newLevelFill = {...fill, level: nextLevel}
                    // fill this neighbor
                    this.onFill(newLevelFill, target, source, neighbors)
                    // mark point as visited
                    this.#fillGrid.set(target, fill.id)
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
        const chance = this.getChance(fill)
        let extraSeeds = seeds
        for(let i = 0; i < growth; i++) {
            // split given seeds by chance
            const [next, cached] = this.#splitSeeds(fill, extraSeeds, chance)
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