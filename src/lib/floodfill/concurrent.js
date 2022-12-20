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

    runStep(id) {
        const seeds = this._growSeeds(id, this.seedTable[id])
        this.seedTable[id] = seeds
        this._growRandomLayers(id)
        return seeds
    }

    _growSeeds(id, seeds) {
        const newSeeds = []
        if (newSeeds.length >= 0) {
            this.levelTable[id] += 1
        }
        for(let seed of seeds) {
            const filledSides = this._fillSides(id, seed)
            newSeeds.push(...filledSides)
        }
        return newSeeds
    }

    _fillSides(id, centerPoint) {
        const refs = {id, fill: this.fill, context: this.context}
        const filledSides = []
        const sidePoints = this.getNeighbors(refs, centerPoint)
        sidePoints.forEach(sidePoint => {
            // visit each side
            // TODO: send centerPoint to methods
            this.checkNeighbor(refs, sidePoint, centerPoint)
            // fill only empty sides
            if (this.isEmpty(refs, sidePoint)) {
                filledSides.push(sidePoint)
                this._fillValue(id, sidePoint, this.levelTable[id])
            }
            if (this.isPhaseEmpty(refs, sidePoint)) {
                this.phaseSeedTable[id].push(sidePoint)
            }
        })
        return filledSides
    }

    _fillValue(id, centerPoint, level) {
        const refs = {id, fill: this.fill, context: this.context}
        this.setValue(refs, centerPoint, level)
        this.areaTable[id] += this.getArea(refs, centerPoint)
    }

    _growRandomLayers(id) {
        const growth = this.growthTable[id]
        for(let i = 0; i < growth; i++) {
            const [extra, other] = this._splitSeeds(id, this.seedTable[id])
            let extraSeeds = this._growSeeds(id, extra)
            this.seedTable[id] = other.concat(extraSeeds)
        }
    }

    _splitSeeds(id, seeds) {
        const first = [], second = []
        const chance = this.chanceTable[id]
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
        for(let id = 0; id < this.origins.length; id ++) {
            const refs = {id, fill: this, context: this.context}
            const origin = this.origins[id]
            this.areaTable.push(0)
            this.levelTable.push(0)
            this.seedTable.push([origin])
            this.phaseSeedTable.push([])
            this.growthTable.push(this.getGrowth(refs, origin))
            this.chanceTable.push(this.getChance(refs, origin))
            this.fillUnit._fillValue(id, origin, 0)  // 0 is level
        }
        let limit = 2000
        // run while has next phases or loop limit ends
        while(this._runFillStep() && limit > 0) {
            limit--
        }
    }

    _runFillStep() {
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
                    this.seedTable[id].push(point)
                    this.fillUnit._fillValue(id, point, this.levelTable[id])
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