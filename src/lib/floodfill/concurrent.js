import { Random } from '/src/lib/random'
import { PointSet } from '/src/lib/point/set'


export class ConcurrentFillUnit {
    constructor(fill, context) {
        this.fill = fill
        this.context = context
        this.seedTable = fill.seedTable
        this.phaseSeedTable = fill.phaseSeedTable
        this.areaTable = fill.areaTable
        this.levelTable = fill.levelTable
        this.growthTable = fill.growthTable
        this.chanceTable = fill.chanceTable
    }

    runStep(fillId) {
        const seeds = this._fillLayer(fillId, this.seedTable[fillId])
        this.seedTable[fillId] = seeds
        this._fillRandomLayers(fillId)
        return seeds
    }

    _fillLayer(fillId, seeds) {
        const newSeeds = []
        if (newSeeds.length >= 0) {
            this.levelTable[fillId] += 1
        }
        for(let seed of seeds) {
            const filledSides = this._fillSeeds(fillId, seed)
            newSeeds.push(...filledSides)
        }
        return newSeeds
    }

    _fillRandomLayers(fillId) {
        const growth = this.growthTable[fillId]
        for(let i = 0; i < growth; i++) {
            const [extra, other] = this._splitSeeds(fillId, this.seedTable[fillId])
            let extraSeeds = this._fillLayer(fillId, extra)
            this.seedTable[fillId] = other.concat(extraSeeds)
        }
    }

    _fillSeeds(fillId, center) {
        const refs = {id: fillId, fill: this.fill, context: this.context}
        const filledSides = []
        const neighbors = this.getNeighbors(refs, center)
        neighbors.forEach(neighbor => {
            // visit each neighbor
            // TODO: send center to methods
            this.checkNeighbor(refs, neighbor, center)
            // fill only empty sides
            if (this.isEmpty(refs, neighbor)) {
                const level = this.levelTable[fillId]
                this._fillCell(fillId, neighbor, level)
                filledSides.push(neighbor)
            }
            if (this.isPhaseEmpty(refs, neighbor)) {
                this.phaseSeedTable[fillId].push(neighbor)
            }
        })
        return filledSides
    }

    _fillCell(fillId, cell, level) {
        const refs = {id: fillId, fill: this.fill, context: this.context}
        this.setValue(refs, cell, level)
        this.areaTable[fillId] += this.getArea(refs, cell)
    }

    _splitSeeds(fillId, seeds) {
        const first = [], second = []
        const chance = this.chanceTable[fillId]
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
    }

    fill() {
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
            this.fillUnit._fillCell(id, origin, 0)
        }
        // run while has next phases or loop limit ends
        while(this._fillByStep() && loopCount > 0) loopCount--
    }

    _fillByStep() {
        let completedFills = 0
        for(let id = 0; id < this.origins.length; id ++) {
            const filledPoints = this.fillUnit.runStep(id)
            if (filledPoints.length === 0) {
                completedFills++
            }
        }
        if (completedFills === this.origins.length) {
            if (this.#phaseIndex === this.phases.length - 1) {
                return false
            }
            // move to next fill phase
            this.phase = this.phases[++this.#phaseIndex]
            // reset all seeds
            for(let id = 0; id < this.origins.length; id ++) {
                const pSet = new PointSet(this.phaseSeedTable[id])
                this.seedTable[id] = []
                this.phaseSeedTable[id] = []
                pSet.forEach(point => {
                    const level = this.levelTable[id]
                    this.seedTable[id].push(point)
                    this.fillUnit._fillCell(id, point, level)
                })

            }
            completedFills = 0  // reset to start new phase
        }
        return true
    }

    getArea(fillId) {
        return this.areaTable[fillId]
    }

    getChance(fill, origin) {
        return 0  // default value
    }

    getGrowth(fill, origin) {
        return 0  // default value
    }
}