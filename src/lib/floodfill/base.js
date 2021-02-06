import { Random } from '/lib/random'


export class BaseFloodFill {
    constructor(origin, params) {
        this.origin = origin
        this.seeds = [origin]
        this.setValue = params.setValue
        this.isEmpty = params.isEmpty

        this.setValue(this.origin)
    }

    canGrow() {
        return this.seeds.length > 0
    }

    grow() {
        this.seeds = this.growLayer()
        return this.seeds
    }

    growLayer(seeds=this.seeds) {
        let newSeeds = []
        for(let i = 0; i < seeds.length; i++) {
            const filledNeighbors = this.fillNeighbors(seeds[i])
            newSeeds.push(...filledNeighbors)
        }
        return newSeeds
    }

    fillNeighbors(point) {
        const filledNeighbors = []
        const emptyNeighbors = point.adjacents(p => this.isEmpty(p))
        for(let i = 0; i < emptyNeighbors.length; i++) {
            const neighbor = emptyNeighbors[i]
            this.setValue(neighbor)
            filledNeighbors.push(neighbor)
        }
        return filledNeighbors
    }
}


export class OrganicFloodFill extends BaseFloodFill {
    constructor(origin, params, iterations=30, variability=.5) {
        super(origin, params)
        this.iterations = iterations
        this.variability = variability
    }

    grow() {
        this.seeds = this.growLayer()
        this.growMore()
        return this.seeds
    }

    growMore() {
        const times = Random.int(this.iterations)
        for(let i = 0; i < times; i++) {
            const [extra, other] = this.splitSeeds(this.seeds, this.variability)
            let extraSeeds = this.growLayer(extra)
            this.seeds = [...other, ...extraSeeds]
        }
    }

    splitSeeds(array, chance) {
        const first = [], second = []
        for(let i = 0; i < array.length; i++) {
            const outputArray = Random.chance(chance) ? first : second
            outputArray.push(array[i])
        }
        return [first, second]
    }
}