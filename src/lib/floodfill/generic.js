import { Random } from '/lib/random'


export class GenericMultiFill {
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

    fill(x) {
        for(let id = 0; id < this.origins.length; id ++) {
            const origin = this.origins[id]
            this.areaTable.push(0)
            this.levelTable.push(0)
            this.seedTable.push([origin])
            this.growthTable.push(this.getGrowth(origin))
            this.chanceTable.push(this.getChance(origin))
            this.filler._fillValue(id, origin)
        }
        while(this.canGrow) {
            this._growFills()
        }
    }

    getArea(id) {
        return this.areaTable[id]
    }

    getChance(origin) {
        return .1
    }

    getGrowth(origin) {
        return 0
    }

    _growFills() {
        let completedFills = 0

        for(let id = 0; id < this.origins.length; id ++) {
            const filledPoints = this.filler.grow(id)
            if (filledPoints.length === 0) {
                completedFills++
            }
        }
        if (completedFills === this.origins.length) {
            this.canGrow = false
        }
    }
}


export class GenericFloodFill {
    constructor(controller) {
        this.model = controller.model
        this.seedTable = controller.seedTable
        this.areaTable = controller.areaTable
        this.levelTable = controller.levelTable
        this.growthTable = controller.growthTable
        this.chanceTable = controller.chanceTable
    }

    grow(id) {
        const seeds = this._growLayer(id, this.seedTable[id])
        this.seedTable[id] = seeds
        this._growRandomLayers(id)
        return seeds
    }

    _fillValue(id, origin) {
        this.setValue(id, origin)
        this.areaTable[id] += this.getArea(origin)
    }

    _growLayer(id, seeds) {
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

    _fillNeighbors(id, origin) {
        const filledNeighbors = []
        const allNeighbors = this.getNeighbors(origin)
        const emptyNeighbors = allNeighbors.filter(neighbor => {
            this.checkNeighbor(id, neighbor, origin)
            return this.isEmpty(neighbor)
        })
        emptyNeighbors.forEach(neighbor => {
            filledNeighbors.push(neighbor)
            this._fillValue(id, neighbor)
        })
        return filledNeighbors
    }

    _growRandomLayers(id) {
        const growth = this.growthTable[id]
        for(let i = 0; i < growth; i++) {
            const [extra, other] = this._splitSeeds(id, this.seedTable[id])
            let extraSeeds = this._growLayer(id, extra)
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

    setValue(id, value) { }

    isEmpty(origin) {
        return []
    }

    getNeighbors(origin) {
        return []
    }

    checkNeighbor(origin) { }

    getArea(value) {
        return 1
    }
}
