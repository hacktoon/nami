

export class FloodFill {
    constructor(origin, params) {
        this.origin = origin
        this.seeds = [origin]
        this.setValue = params.setValue
        this.isEmpty = params.isEmpty
        this.checkNeighbor = params.checkNeighbor

        this.setValue(this.origin)
        this.area = 1
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

    fillNeighbors(origin) {
        const filledNeighbors = []
        const emptyNeighbors = origin.adjacents(adjacent => {
            this.checkNeighbor(adjacent, origin)
            return this.isEmpty(adjacent)
        })
        for(let i = 0; i < emptyNeighbors.length; i++) {
            const neighbor = emptyNeighbors[i]
            this.setValue(neighbor)
            this.area += 1
            filledNeighbors.push(neighbor)
        }
        return filledNeighbors
    }
}


export class MultiFill {
    constructor(fills) {
        this.fills = fills
        this.canGrow = true

        while(this.canGrow) {
            this.grow()
        }
    }

    forEach(callback) {
        this.fills.forEach(callback)
    }

    grow() {
        let totalFull = 0
        for(let i = 0; i < this.fills.length; i++) {
            const filled = this.fills[i].grow()
            if (filled.length === 0) totalFull++
        }
        if (totalFull === this.fills.length) {
            this.canGrow = false
        }
    }
}

