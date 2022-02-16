import { Random } from '/src/lib/random'


export class ConcurrentFillUnit {
    constructor(multiFill, context) {
        this.context = context
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
        const fill = {id, context: this.context}
        this.setValue(fill, origin, level)
        this.areaTable[id] += this.getArea(fill, origin)
    }

    _fillNeighbors(id, origin) {
        const fill = {id, context: this.context}
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

    isEmpty(fill, origin) {
        return []
    }

    getNeighbors(fill, origin) {
        return []
    }

    checkNeighbor(fill, neighbor, origin) { }

    getArea(fill, origin) {
        return 1
    }
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
        this.filler = new FillUnit(this, context)
    }

    fill() {
        for(let fillId = 0; fillId < this.origins.length; fillId ++) {
            const fill = {id: fillId, context: this.context}
            const origin = this.origins[fillId]
            this.areaTable.push(0)
            this.levelTable.push(0)
            this.seedTable.push([origin])
            this.growthTable.push(this.getGrowth(fill, origin))
            this.chanceTable.push(this.getChance(fill, origin))
            this.filler._fillValue(fillId, origin, 0)
        }
        while(this.canGrow) {
            this._growFills()
        }
    }

    getArea(fillId) {
        return this.areaTable[fillId]
    }

    getChance(fill, origin) {
        return .1  // default value
    }

    getGrowth(fill, origin) {
        return 0  // default value
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