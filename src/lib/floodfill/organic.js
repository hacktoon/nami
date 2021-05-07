import { Random } from '/lib/base/random'
import { FloodFill } from './index'


export class OrganicFloodFill extends FloodFill {
    constructor(origin, fillConfig) {
        super(origin, fillConfig)
        this.growth = fillConfig.growth
        this.chance = fillConfig.chance
    }

    grow() {
        this.seeds = this.growLayer()
        this.growRandomLayers()
        return this.seeds
    }

    growRandomLayers() {
        for(let i = 0; i < this.growth; i++) {
            const [extra, other] = this.splitSeeds(this.seeds)
            let extraSeeds = this.growLayer(extra)
            this.seeds = [...other, ...extraSeeds]
        }
    }

    splitSeeds(array) {
        const first = [], second = []
        for(let seed of array) {
            const outputArray = Random.chance(this.chance) ? first : second
            outputArray.push(seed)
        }
        return [first, second]
    }
}
