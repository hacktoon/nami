import { Random } from '/lib/random'


export class ConcurrentFillUnit {
    constructor(multiFill) {
        this.model = multiFill.model
        this.seedTable = multiFill.seedTable
        this.areaTable = multiFill.areaTable
        this.levelTable = multiFill.levelTable
        this.growthTable = multiFill.growthTable
        this.chanceTable = multiFill.chanceTable
    }

    grow(id) {
        const seeds = this._growSeeds(id, this.seedTable[id])
        this.seedTable[id] = seeds
        this._growRandomLayers(id)
        return seeds
    }

    _growSeeds(id, seeds) {
        let newSeeds = []
        for(let seed of seeds) {
            const filledNeighbors = this._fillNeighbors(id, seed)
            newSeeds.push(...filledNeighbors)
        }
        if (newSeeds.length >= 0) {
            this.levelTable[id] += 1
        }
        return newSeeds
    }

    _fillValue(id, origin, level) {
        this.setValue(id, origin, level)
        this.areaTable[id] += this.getArea(origin)
    }

    _fillNeighbors(id, origin) {
        const filledNeighbors = []
        const allNeighbors = this.getNeighbors(origin)
        const emptyNeighbors = allNeighbors.filter(neighbor => {
            this.checkNeighbor(id, neighbor, origin)
            return this.isEmpty(neighbor)
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

    setValue(fillId, value, level) { }

    isEmpty(origin) {
        return []
    }

    getNeighbors(origin) {
        return []
    }

    checkNeighbor(fillId, neighbor, origin) { }

    getArea(fillId) {
        return 1
    }
}


export class ConcurrentFill {
    constructor(origins, model, FillClass) {
        this.origins = origins
        this.model = model
        this.seedTable = []
        this.levelTable = []
        this.areaTable = []
        this.growthTable = []
        this.chanceTable = []
        this.canGrow = true
        this.filler = new FillClass(this)
    }

    fill() {
        for(let fillId = 0; fillId < this.origins.length; fillId ++) {
            const origin = this.origins[fillId]
            this.areaTable.push(0)
            this.levelTable.push(0)
            this.seedTable.push([origin])
            this.growthTable.push(this.getGrowth(fillId, origin))
            this.chanceTable.push(this.getChance(fillId, origin))
            this.filler._fillValue(fillId, origin, 0)
        }
        while(this.canGrow) {
            this._growFills()
        }
    }

    getArea(fillId) {
        return this.areaTable[fillId]
    }

    getChance(origin) {
        return .1
    }

    getGrowth(origin) {
        return 0
    }

    _growFills() {
        let completedFills = 0

        for(let fillId = 0; fillId < this.origins.length; fillId ++) {
            const filledPoints = this.filler.grow(fillId)
            if (filledPoints.length === 0) {
                completedFills++
            }
        }
        if (completedFills === this.origins.length) {
            this.canGrow = false
        }
    }
}