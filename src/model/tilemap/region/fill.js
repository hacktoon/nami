import { Random } from '/lib/base/random'
import { Point } from '/lib/base/point'


const NO_REGION = null


export class RegionMultiFill {
    constructor(origins, model) {
        this.fills = origins.map((origin, id) => {
            return new RegionFloodFill(id, origin, model)
        })
        this.canGrow = true

        while(this.canGrow) {
            this._growFills()
        }
    }

    forEach(callback) {
        for(let fill of this.fills) {
            callback(fill)
        }
    }

    _growFills() {
        let completedFills = 0
        for(let fill of this.fills) {
            const filledPoints = fill.grow()
            if (filledPoints.length === 0) {
                completedFills++
            }
        }
        if (completedFills === this.fills.length) {
            this.canGrow = false
        }
    }
}


class RegionFloodFill {
    constructor(id, origin, model) {
        this.id = id
        this.origin = origin
        this.model = model
        this._seeds = [origin]
        this._level = 0
        this.area = 0

        this.growth = model.growth ?? 1
        this.chance = model.chance ?? .1

        this._fillValue(origin)
    }

    grow() {
        this._seeds = this._growLayer()
        this._growRandomLayers()
        return this._seeds
    }

    _growLayer(seeds=this._seeds) {
        let newSeeds = []
        for(let seed of seeds) {
            const filledNeighbors = this._fillNeighbors(seed)
            newSeeds.push(...filledNeighbors)
        }
        if (newSeeds.length > 0) {
            this._level += 1
        }
        return newSeeds
    }

    _fillValue(point) {
        this.setValue(point, this._level)
        this.area += 1
    }

    _fillNeighbors(origin) {
        const filledNeighbors = []
        const allNeighbors = this.getNeighbors(origin)
        const emptyNeighbors = allNeighbors.filter(neighbor => {
            this.checkNeighbor(neighbor, origin, this._level)
            return this.isEmpty(neighbor, origin, this._level)
        })
        emptyNeighbors.forEach(neighbor => {
            filledNeighbors.push(neighbor)
            this._fillValue(neighbor)
        })
        return filledNeighbors
    }

    _growRandomLayers() {
        for(let i = 0; i < this.growth; i++) {
            const [extra, other] = this._splitSeeds(this._seeds)
            let extraSeeds = this._growLayer(extra)
            this._seeds = [...other, ...extraSeeds]
        }
    }

    _splitSeeds(array) {
        const first = [], second = []
        for(let seed of array) {
            const outputArray = Random.chance(this.chance) ? first : second
            outputArray.push(seed)
        }
        return [first, second]
    }

    isEmpty(point) {
        return this.model.regionMatrix.get(point) === NO_REGION
    }

    setValue(point, level) {
        this.model.regionMatrix.set(point, this.id)
        this.model.levelMatrix.set(point, level)
    }

    checkNeighbor(neighborPoint, fillPoint) {
        if (this.isEmpty(neighborPoint)) return
        const neighborId = this.model.regionMatrix.get(neighborPoint)
        if (this.id === neighborId) return
        // mark region when neighbor point is filled by other region
        this.model.graph.setEdge(this.id, neighborId)
        this.model.borderMatrix.get(fillPoint).add(neighborId)
    }

    getNeighbors(originPoint) {
        return Point.adjacents(originPoint)
    }
}
