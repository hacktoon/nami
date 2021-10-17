import { Random } from '/lib/random'


export class GenericMultiFill {
    constructor(origins, model, FillClass) {
        this.origins = origins
        this.seedTable = []
        this.levelTable = []
        this.areaTable = []
        this.growthTable = []
        this.chanceTable = []
        this.model = model
        this.canGrow = true
        this.filler = new FillClass(this)
    }

    fill() {
        for(let id = 0; id < this.origins.length; id ++) {
            const origin = this.origins[id]
            this.areaTable.push(0)
            this.levelTable.push(0)
            this.seedTable.push([origin])
            this.growthTable.push(this.getGrowth(origin))
            this.chanceTable.push(this.getChance(origin))
            this.filler._fillValue(origin, id)
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
        this.growth = controller.model.growth ?? 1
        this.chance = controller.model.chance ?? .1
    }

    grow(id) {
        const seeds = this._growLayer(id, this.seedTable[id])
        this.seedTable[id] = seeds
        this._growRandomLayers(id)
        return seeds
    }

    _fillValue(value, id) {
        this.setValue(id, value)
        this.areaTable[id] += this.getArea(value)
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
            this._fillValue(neighbor, id)
        })
        return filledNeighbors
    }

    _growRandomLayers(id) {
        for(let i = 0; i < this.growth; i++) {
            const [extra, other] = this._splitSeeds(this.seedTable[id])
            let extraSeeds = this._growLayer(id, extra)
            this.seedTable[id] = other.concat(extraSeeds)
        }
    }

    _splitSeeds(seeds) {
        const first = [], second = []
        for(let seed of seeds) {
            const outputArray = Random.chance(this.chance) ? first : second
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
