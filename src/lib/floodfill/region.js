import { Random } from '/lib/base/random'
import { FloodFill } from './index'


export class RegionFloodFill {
    constructor(origin, fillConfig) {
        this.config = fillConfig
        this.origin = origin
        this._seeds = [origin]
        this.count = 0
        this._level = 0
        this.growth = fillConfig.growth ?? 1
        this.chance = fillConfig.chance ?? .1
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
        this.config.setValue(point, this._level)
        this.count += 1
    }

    _fillNeighbors(origin) {
        const filledNeighbors = []
        const allNeighbors = this.config.getNeighbors(origin)
        const emptyNeighbors = allNeighbors.filter(neighbor => {
            this.config.checkNeighbor(neighbor, origin, this._level)
            return this.config.isEmpty(neighbor, origin, this._level)
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
}
