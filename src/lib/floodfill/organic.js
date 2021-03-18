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
        this.growMore()
        return this.seeds
    }

    growMore() {
        for(let i = 0; i < this.growth; i++) {
            this.growRandomLayer()
        }
    }

    growRandomLayer() {
        const [extra, other] = this.splitSeeds(this.seeds)
        let extraSeeds = this.growLayer(extra)
        this.seeds = [...other, ...extraSeeds]
    }

    splitSeeds(array) {
        const first = [], second = []
        for(let i = 0; i < array.length; i++) {
            const outputArray = Random.chance(this.chance) ? first : second
            outputArray.push(array[i])
        }
        return [first, second]
    }
}
