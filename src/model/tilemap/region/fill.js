import { Random } from '/lib/base/random'
import { Point } from '/lib/base/point'


const NO_REGION = null


export class RegionMultiFill {
    constructor(origins, model) {
        this.origins = origins
        this.seedTable = []
        this.levelTable = []
        this.model = model
        this.canGrow = true
        this.fill = new RegionFloodFill(
            this.model,
            this.seedTable,
            this.levelTable,
        )
        for(let id=0; id<origins.length; id++) {
            const origin = origins[id]
            this.model.areaTable.push(0)
            this.seedTable.push([origin])
            this.levelTable.push(0)
            this.fill.fillPoint(id, origin)
        }
        while(this.canGrow) {
            this._growFills()
        }
    }

    forEach(callback) {
        for(let id=0; id<this.origins.length; id++) {
            const origin = this.origins[id]
            const area = this.model.areaTable[id]
            callback(id, origin, area)
        }
    }

    _growFills() {
        let completedFills = 0

        for(let id=0; id<this.origins.length; id++) {
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


class RegionFloodFill {
    constructor(model, seedTable, levelTable) {
        this.model = model
        this.seedTable = seedTable
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

    fillPoint(id, point) {
        this.setValue(id, point)
        this.model.areaTable[id] += 1
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
            this.fillPoint(id, neighbor)
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

    // override
    setValue(id, point) {
        const level = this.levelTable[id]
        this.model.regionMatrix.set(point, id)
        this.model.levelMatrix.set(point, level)
    }

    // override
    isEmpty(point) {
        return this.model.regionMatrix.get(point) === NO_REGION
    }

    // override
    checkNeighbor(id, neighborPoint, fillPoint) {
        if (this.isEmpty(neighborPoint)) return
        const neighborId = this.model.regionMatrix.get(neighborPoint)
        if (id === neighborId) return
        // mark region when neighbor point is filled by other region
        this.model.graph.setEdge(id, neighborId)
        this.model.borderMatrix.get(fillPoint).add(neighborId)
    }

    // override
    getNeighbors(originPoint) {
        return Point.adjacents(originPoint)
    }
}
