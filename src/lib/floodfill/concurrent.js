import { Random } from '/src/lib/random'
import { Point } from '/src/lib/point'


export class ConcurrentFillUnit {
    constructor(fill, context) {
        this.fill = fill
        this.context = context
        this.seedTable = fill.seedTable
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
            const filledNeighbors = this._fillNeighbors(id, seed)
            newSeeds.push(...filledNeighbors)
        }
        return newSeeds
    }

    _fillValue(id, centerPoint, level) {
        const refs = {id, fill: this.fill, context: this.context}
        this.setValue(refs, centerPoint, level)
        this.areaTable[id] += this.getArea(refs, centerPoint)
    }

    _fillNeighbors(id, centerPoint) {
        const refs = {id, fill: this.fill, context: this.context}
        const filledSides = []
        const sidesPoints = this.getNeighbors(refs, centerPoint)
        sidesPoints.forEach(sidePoint => {
            this.checkNeighbor(refs, sidePoint, centerPoint)
            if (this.isEmpty(refs, sidePoint)) {
                filledSides.push(sidePoint)
                this._fillValue(id, sidePoint, this.levelTable[id])
            }
        })
        return filledSides
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
    getNeighbors(fill, origin) { return [] }
    checkNeighbor(fill, neighbor, origin) { }
    getArea(fill, origin) { return 1 }
}


export class ConcurrentFill {
    constructor(origins, FillUnit, context={}, phases=[]) {
        this.origins = origins
        this.context = context
        this.seedTable = []
        this.levelTable = []
        this.areaTable = []
        this.growthTable = []
        this.chanceTable = []
        this.phases = phases.length > 0 ? phases : [0]
        this.phase = this.phases[0]
        this.fillUnit = new FillUnit(this, context)
    }

    fill() {
        for(let id = 0; id < this.origins.length; id ++) {
            const refs = {id, fill: this, context: this.context}
            const origin = this.origins[id]
            this.areaTable.push(0)
            this.levelTable.push(0)
            this.seedTable.push([origin])
            this.growthTable.push(this.getGrowth(refs, origin))
            this.chanceTable.push(this.getChance(refs, origin))
            this.fillUnit._fillValue(id, origin, 0)
        }
        // run while has next phases
        while(this._runFillStep()) {}
    }

    _runFillStep() {
        let completedFills = 0
        for(let fillId = 0; fillId < this.origins.length; fillId ++) {
            const filledPoints = this.fillUnit.runStep(fillId)
            if (filledPoints.length === 0) {
                completedFills++
            }
        }
        if (completedFills === this.origins.length) {
            if (this.phase < this.phases.length) {
                this.phase++
                completedFills = 0  // reset to start new phase
            } else {
                return false
            }
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