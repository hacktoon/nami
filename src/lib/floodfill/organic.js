import { Random } from '/lib/base/random'
import { FloodFill } from './index'


export class OrganicFloodFill extends FloodFill {
    constructor(origin, fillConfig) {
        super(origin, fillConfig)
        this.growth = fillConfig.growth
        this.chance = fillConfig.chance
    }

    grow() {
        this._seeds = this.growLayer()
        this._growRandomLayers()
        return this._seeds
    }

    _growRandomLayers() {
        for(let i = 0; i < this.growth; i++) {
            const [extra, other] = this._splitSeeds(this._seeds)
            let extraSeeds = this.growLayer(extra)
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
