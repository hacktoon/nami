

export class FloodFill {
    constructor(origin, config) {
        this.origin = origin
        this.seeds = [origin]
        this.config = config

        this.config.setValue(this.origin)
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
            this.config.checkNeighbor(adjacent, origin)
            return this.config.isEmpty(adjacent)
        })
        emptyNeighbors.forEach(neighbor => {
            filledNeighbors.push(neighbor)
            this.config.setValue(neighbor)
        })
        return filledNeighbors
    }
}


export class MultiFill {
    constructor(fills) {
        this.fills = fills
        this.canGrow = true
    }

    fill() {
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

