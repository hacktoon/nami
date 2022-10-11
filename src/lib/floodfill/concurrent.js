import { Random } from '/src/lib/random'


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
        let newSeeds = []
        if (newSeeds.length >= 0) {
            this.levelTable[id] += 1
        }
        for(let seed of seeds) {
            const filledNeighbors = this._fillNeighbors(id, seed)
            newSeeds.push(...filledNeighbors)
        }
        return newSeeds
    }

    _fillValue(id, origin, level) {
        const fill = {id, fill: this.fill, context: this.context}
        this.setValue(fill, origin, level)
        this.areaTable[id] += this.getArea(fill, origin)
    }

    _fillNeighbors(id, origin) {
        const fill = {id, fill: this.fill, context: this.context}
        const filledNeighbors = []
        const allNeighbors = this.getNeighbors(fill, origin)
        const emptyNeighbors = allNeighbors.filter(neighbor => {
            this.checkNeighbor(fill, neighbor, origin)
            return this.isEmpty(fill, neighbor)
        })
        emptyNeighbors.forEach(neighbor => {
            filledNeighbors.push(neighbor)
            this._fillValue(id, neighbor, this.levelTable[id])
        })
        return filledNeighbors
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
    constructor(origins, FillUnit, context={}) {
        this.origins = origins
        this.context = context
        this.seedTable = []
        this.levelTable = []
        this.areaTable = []
        this.growthTable = []
        this.chanceTable = []
        this.canGrow = true
        this.fillUnit = new FillUnit(this, context)
    }

    fill() {
        for(let fillId = 0; fillId < this.origins.length; fillId ++) {
            const fill = {
                id: fillId,
                fill: this.fill,
                context: this.context
            }
            const origin = this.origins[fillId]
            this.areaTable.push(0)
            this.levelTable.push(0)
            this.seedTable.push([origin])
            this.growthTable.push(this.getGrowth(fill, origin))
            this.chanceTable.push(this.getChance(fill, origin))
            this.fillUnit._fillValue(fillId, origin, 0)
        }
        while(this.canGrow) {
            this._runFillStep()
        }
    }

    _runFillStep() {
        let completedFills = 0

        for(let fillId = 0; fillId < this.origins.length; fillId ++) {
            const filledPoints = this.fillUnit.runStep(fillId)
            if (filledPoints.length === 0) {
                completedFills++
            }
        }
        let allFillsComplete = completedFills === this.origins.length
        if (allFillsComplete) {
            // completedFills = 0  // reset to start new phase
            this.canGrow = false
        }
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