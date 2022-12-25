import { Random } from '/src/lib/random'


const MAX_LOOP_COUNT = 100


export class ConcurrentFill {
    #origins
    #phase
    #phases
    #phaseIndex = 0
    #areaTable = []
    #levelTable = []
    #seedTable = []
    #phaseSeedTable = []
    #growthTable = []
    #chanceTable = []

    constructor(origins, context={}, phases=null) {
        this.#origins = origins
        this.#phases = phases ?? [0]
        this.#phase = this.#phases[this.#phaseIndex]
        this.context = context

        // fill a layer for each fill based on initial seeds
        for(let fillId = 0; fillId < this.#origins.length; fillId ++) {
            const refs = {id: fillId, fill: this}
            const origin = this.#origins[fillId]
            this.#areaTable.push(0)
            this.#levelTable.push(0)
            this.#seedTable.push([origin])
            this.#phaseSeedTable.push([])
            this.#growthTable.push(this.getGrowth(refs, origin))
            this.#chanceTable.push(this.getChance(refs, origin))
            this.#fillSeed(fillId, origin, 0)
        }
        // run while has next phases or loop limit ends
        let loopCount = MAX_LOOP_COUNT
        while(this.#fillPhase() && loopCount > 0) {
            loopCount--
        }
    }

    get phase() {
        return this.#phases[this.#phaseIndex]
    }

    #fillPhase() {
        // a phase can have many layers
        let completedFills = 0
        for(let fillId = 0; fillId < this.#origins.length; fillId ++) {
            // fill a single layer
            const seeds = this.#fillSingleLayer(fillId, this.#seedTable[fillId])
            this.#seedTable[fillId] = seeds
            // fill optional extra layers
            this.#fillRandomLayers(fillId)
            // if has seeds to fill, advance fill level
            const totalSeeds = this.#seedTable[fillId].length
            if (totalSeeds >= 0) {
                this.#levelTable[fillId] += 1
            }
            // this fill has no seeds, increase
            if (totalSeeds === 0) {
                completedFills++
            }
        }
        // fills are complete for this phase layer
        // console.log(this.#chanceTable);
        if (completedFills === this.#origins.length) {
            // reached last phase, quit
            if (this.#phaseIndex === this.#phases.length - 1) {
                return false
            }
            // move to next fill phase
            this.#phase = this.#phases[++this.#phaseIndex]
            // reset seed tables for next phase
            this.#resetPhaseSeeds()
        }
        return true
    }

    #resetPhaseSeeds() {
        for(let id = 0; id < this.#origins.length; id ++) {
            const phaseSeeds = this.#phaseSeedTable[id]
            this.#seedTable[id] = []
            this.#phaseSeedTable[id] = []
            phaseSeeds.forEach(seed => {
                const level = this.#levelTable[id]
                this.#seedTable[id].push(seed)
                // set seeds for next phase
                this.#fillSeed(id, seed, level)
            })
        }
    }

    #fillSingleLayer(fillId, seeds) {
        // fill a single layer of fixed neighbor seeds
        const newSeeds = []
        for(let seed of seeds) {
            const filled = this.#fillEmptySeeds(fillId, seed)
            newSeeds.push(...filled)
        }
        return newSeeds
    }

    #fillRandomLayers(fillId) {
        // run zero or more fill steps of random seeds
        const growth = this.#growthTable[fillId]
        const seeds = this.#seedTable[fillId]
        for(let i = 0; i < growth; i++) {
            const [extra, other] = this.#splitSeeds(fillId, seeds)
            let extraSeeds = this.#fillSingleLayer(fillId, extra)
            this.#seedTable[fillId] = other.concat(extraSeeds)
        }
    }

    #splitSeeds(fillId, seeds) {
        const first = [], second = []
        const chance = this.#chanceTable[fillId]
        for(let seed of seeds) {
            const outputArray = Random.chance(chance) ? first : second
            outputArray.push(seed)
        }
        return [first, second]
    }

    #fillEmptySeeds(fillId, center) {
        const refs = {id: fillId, fill: this}
        const filledCells = []
        const neighbors = this.getNeighbors(refs, center)
        neighbors.forEach(neighbor => {
            // visit each neighbor
            // TODO: send center to methods
            this.checkNeighbor(refs, neighbor, center)
            // fill only empty sides
            if (this.isEmpty(refs, neighbor)) {
                const level = this.#levelTable[fillId]
                this.#fillSeed(fillId, neighbor, level)
                filledCells.push(neighbor)
            }
            if (this.isPhaseEmpty(refs, neighbor)) {
                this.#phaseSeedTable[fillId].push(neighbor)
            }
        })
        return filledCells
    }

    #fillSeed(fillId, cell, level) {
        const refs = {id: fillId, fill: this}
        this.setValue(refs, cell, level)
        this.#areaTable[fillId] += 1
    }

    // EXTENSIBLE METHODS ==========================
    getArea(fillId) {
        return this.#areaTable[fillId]
    }

    getChance(fillId, origin) {
        return 0  // default value
    }

    getGrowth(fillId, origin) {
        return 0  // default value
    }

    setValue(refs, center, level) { }
    isEmpty(refs, center) { return [] }
    isPhaseEmpty(refs, center) { return [] }
    getNeighbors(refs, center) { return [] }
    checkNeighbor(refs, neighbor, center) { }
}

export class ConcurrentFillUnit {}