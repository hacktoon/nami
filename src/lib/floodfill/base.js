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
        const seeds = this.growLayer()
        return seeds
    }

    growLayer() {
        let seeds = []
        for(let i = 0; i < this.seeds.length; i++) {
            const filledNeighbors = this.fillNeighbors(this.seeds[i])
            seeds.push(...filledNeighbors)
        }
        this.seeds = seeds
        return seeds
    }

    fillNeighbors(point) {
        const emptyNeighbors = point.adjacents(p => this.isEmpty(p))
        let filledNeighbors = []
        for(let i = 0; i < emptyNeighbors.length; i++) {
            const neighbor = emptyNeighbors[i]
            this.setValue(neighbor)
            filledNeighbors.push(neighbor)
        }
        return filledNeighbors
    }
}