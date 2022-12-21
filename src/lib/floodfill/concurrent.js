import { Random } from '/src/lib/random'


export class ConcurrentFill {
    #phaseIndex = 0

    constructor(origins, FillUnit, context={}, phases=[]) {
        this.origins = origins
        this.context = context
        this.seedTable = []
        this.phaseSeedTable = []
        this.levelTable = []
        this.areaTable = []
        this.growthTable = []
        this.chanceTable = []
        this.phases = phases.length > 0 ? phases : [0]
        this.phase = this.phases[this.#phaseIndex]
        this.fillUnit = new FillUnit(this, context)
        this.#build()
    }

    #build() {
        let loopCount = 2000
        for(let id = 0; id < this.origins.length; id ++) {
            const refs = {id, fill: this, context: this.context}
            const origin = this.origins[id]
            this.areaTable.push(0)
            this.levelTable.push(0)
            this.seedTable.push([origin])
            this.phaseSeedTable.push([])
            this.growthTable.push(this.getGrowth(refs, origin))
            this.chanceTable.push(this.getChance(refs, origin))
            this.fillUnit.fillSeed(id, origin, 0)
        }
        // run while has next phases or loop limit ends
        while(this.#fillPhaseLayer() && loopCount > 0) {
            loopCount--
        }
    }

    #fillPhaseLayer() {
        // a phase can have many layers
        let completedFills = 0
        for(let id = 0; id < this.origins.length; id ++) {
            // call unit fill for this layer
            const filledPoints = this.fillUnit.fillLayer(id)
            if (filledPoints.length === 0) {
                completedFills++
            }
        }
        // if fills are complete for this phase layer
        if (completedFills === this.origins.length) {
            const lastIndex = this.phases.length - 1
            if (this.#phaseIndex === lastIndex) return false

            // move to next fill phase
            this.phase = this.phases[++this.#phaseIndex]
            // reset all seeds
            for(let id = 0; id < this.origins.length; id ++) {
                const phaseSeeds = this.phaseSeedTable[id]
                this.seedTable[id] = []
                this.phaseSeedTable[id] = []
                phaseSeeds.forEach(point => {
                    const level = this.levelTable[id]
                    this.seedTable[id].push(point)
                    this.fillUnit.fillSeed(id, point, level)
                })
            }
            completedFills = 0  // reset to start new phase
        }
        return true
    }

    getArea(fillId) {
        return this.areaTable[fillId]
    }

    getChance(fillId, origin) {
        return 0  // default value
    }

    getGrowth(fillId, origin) {
        return 0  // default value
    }
}


export class ConcurrentFillUnit {
    constructor(fill, context) {
        this.fill = fill
        this.context = context
    }

    fillLayer(fillId) {
        // fill a seed layer, composed by (base + optional random) layers
        const seeds = this.#fillBaseLayer(fillId, this.fill.seedTable[fillId])
        // optional depending on growth and chance inputs
        this.#fillRandomLayers(fillId, seeds)
        this.fill.seedTable[fillId] = seeds
        return seeds
    }

    #fillBaseLayer(fillId, seeds) {
        // fill a single layer of fixed neighbor seeds
        const newSeeds = []
        // if has seeds to fill, advance fill level
        if (newSeeds.length >= 0) {
            this.fill.levelTable[fillId] += 1
        }
        for(let seed of seeds) {
            const filledNeighbors = this.#fillSeeds(fillId, seed)
            newSeeds.push(...filledNeighbors)
        }
        return newSeeds
    }

    #fillRandomLayers(fillId, seeds) {
        // run zero or more fill steps of random seeds
        const growth = this.fill.growthTable[fillId]
        for(let i = 0; i < growth; i++) {
            const [extra, other] = this._splitSeeds(fillId, seeds)
            let extraSeeds = this.#fillBaseLayer(fillId, extra)
            this.fill.seedTable[fillId] = other.concat(extraSeeds)
        }
    }

    #fillSeeds(fillId, center) {
        const refs = {id: fillId, fill: this.fill, context: this.context}
        const filledSides = []
        const neighbors = this.getNeighbors(refs, center)
        neighbors.forEach(neighbor => {
            // visit each neighbor
            // TODO: send center to methods
            this.checkNeighbor(refs, neighbor, center)
            // fill only empty sides
            if (this.isEmpty(refs, neighbor)) {
                const level = this.fill.levelTable[fillId]
                this.fillSeed(fillId, neighbor, level)
                filledSides.push(neighbor)
            }
            if (this.isPhaseEmpty(refs, neighbor)) {
                this.fill.phaseSeedTable[fillId].push(neighbor)
            }
        })
        return filledSides
    }

    fillSeed(fillId, cell, level) {
        const refs = {id: fillId, fill: this.fill, context: this.context}
        this.setValue(refs, cell, level)
        this.fill.areaTable[fillId] += this.getArea(refs, cell)
    }

    _splitSeeds(fillId, seeds) {
        const first = [], second = []
        const chance = this.fill.chanceTable[fillId]
        for(let seed of seeds) {
            const outputArray = Random.chance(chance) ? first : second
            outputArray.push(seed)
        }
        return [first, second]
    }

    // EXTENSIBLE METHODS ==========================

    setValue(fill, origin, level) { }
    isEmpty(fill, origin) { return [] }
    isPhaseEmpty(fill, origin) { return [] }
    getNeighbors(fill, origin) { return [] }
    checkNeighbor(fill, neighbor, origin) { }
    getArea(fill, origin) { return 1 }
}
