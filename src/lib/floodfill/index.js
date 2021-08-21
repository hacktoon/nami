
export class FloodFill {
    constructor(origin, config=new FloodFillConfig()) {
        this.config = config
        this.origin = origin
        this._seeds = [origin]
        this.count = 0
        this._level = 0

        this._fillValue(origin)
    }

    grow() {
        this._seeds = this._growLayer()
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
}


export class MultiFill {
    constructor(fills) {
        this.fills = fills
        this.canGrow = true

        while(this.canGrow) {
            this._growFills()
        }
    }

    map(callback) {
        return this.fills.map(fill => callback(fill))
    }

    forEach(callback) {
        this.fills.forEach(callback)
    }

    _growFills() {
        let completedFills = 0
        for(let fill of this.fills) {
            const filledPoints = fill.grow()
            if (filledPoints.length === 0) {
                completedFills++
            }
        }
        if (completedFills === this.fills.length) {
            this.canGrow = false
        }
    }
}


export class FloodFillConfig {
    isEmpty(cell) { return false }
    setValue(cell, level) {}
    checkNeighbor(neighbor, reference) {}
    getNeighbors(cell) { return [] }
}
