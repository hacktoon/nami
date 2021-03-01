import { Random } from '/lib/base/random'
import { FloodFill, MultiFill } from './index'


export class OrganicFloodFill extends FloodFill {
    constructor(origin, params) {
        super(origin, params)
        this.growth = params.growth ?? 20
        this.chance = params.chance ?? .2
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
