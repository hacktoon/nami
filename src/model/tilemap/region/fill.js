import { Random } from '/lib/base/random'
import { Point } from '/lib/base/point'


const NO_REGION = null


class GenericMultiFill {
    constructor(origins, model, fillClass) {
        this.origins = origins
        this.seedTable = []
        this.levelTable = []
        this.areaTable = []
        this.model = model
        this.canGrow = true
        this.fill = new fillClass(
            this.model,
            this.seedTable,
            this.levelTable,
            this.areaTable,
        )
        for(let id = 0; id < origins.length; id ++) {
            const origin = origins[id]
            this.areaTable.push(0)
            this.levelTable.push(0)
            this.seedTable.push([origin])
            this.fill.fillPoint(origin, id)
        }
        while(this.canGrow) {
            this._growFills()
        }
    }

    getArea(id) {
        return this.areaTable[id]
    }

    forEach(callback) {
        for(let id = 0; id < this.origins.length; id ++) {
            const origin = this.origins[id]
            const area = this.areaTable[id]
            callback(id, origin, area)
        }
    }

    _growFills() {
        let completedFills = 0

        for(let id = 0; id < this.origins.length; id ++) {
            const filledPoints = this.fill.grow(id)
            if (filledPoints.length === 0) {
                completedFills++
            }
        }
        if (completedFills === this.origins.length) {
            this.canGrow = false
        }
    }
}


class GenericFloodFill {
    constructor(model, seedTable, levelTable, areaTable) {
        this.model = model
        this.seedTable = seedTable
        this.areaTable = areaTable
        this.levelTable = levelTable
        this.growth = model.growth ?? 1
        this.chance = model.chance ?? .1
    }

    grow(id) {
        const seeds = this._growLayer(id, this.seedTable[id])
        this.seedTable[id] = seeds
        this._growRandomLayers(id)
        return seeds
    }

    fillPoint(point, id) {
        this.setValue(id, point)
        this.areaTable[id] += 1
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
            this.fillPoint(neighbor, id)
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
}

// ===============================================

class RegionFloodFill extends GenericFloodFill {
    setValue(id, point) {
        const level = this.levelTable[id]
        this.model.regionMatrix.set(point, id)
        this.model.levelMatrix.set(point, level)
    }

    isEmpty(point) {
        return this.model.regionMatrix.get(point) === NO_REGION
    }

    checkNeighbor(id, neighborPoint, centerPoint) {
        if (this.isEmpty(neighborPoint)) return
        const neighborId = this.model.regionMatrix.get(neighborPoint)
        if (id === neighborId) return
        // mark region when neighbor point is filled by other region
        this.model.graph.setEdge(id, neighborId)
        this.model.borderMatrix.get(centerPoint).add(neighborId)
    }

    getNeighbors(originPoint) {
        return Point.adjacents(originPoint)
    }
}


export class RegionMultiFill extends GenericMultiFill {
    constructor(origins, model) {
        super(origins, model, RegionFloodFill)
    }
}
