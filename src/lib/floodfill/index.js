

export class FloodFill {
    constructor(origin, config) {
        this.origin = origin
        this.seeds = [origin]
        this.config = config
        this.level = 0
        this.config.setValue(this.origin,  this.level)
    }

    grow() {
        this.seeds = this.growLayer()
        return this.seeds
    }

    growLayer(seeds=this.seeds) {
        let newSeeds = []
        for(let i = 0; i < seeds.length; i++) {
            const filledNeighbors = this.#fillNeighbors(seeds[i])
            newSeeds.push(...filledNeighbors)
        }
        if (newSeeds.length > 0) {
            this.level += 1
        }
        return newSeeds
    }

    #fillNeighbors(origin) {
        const filledNeighbors = []
        const allNeighbors = this.config.getNeighbors(origin)
        const emptyNeighbors = allNeighbors.filter(neighbor => {
            this.config.checkNeighbor(neighbor, origin)
            return this.config.isEmpty(neighbor)
        })
        emptyNeighbors.forEach(neighbor => {
            filledNeighbors.push(neighbor)
            this.config.setValue(neighbor,  this.level)
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

