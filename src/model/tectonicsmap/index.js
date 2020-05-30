

export class TectonicsMap {
    constructor(seed, regionMap) {
        this.width = grid.width
        this.height = grid.height
        this.regionMap = regionMap
        this.seed = seed
    }

    get(point) {
        const id = this.grid.get(point).value
        return this.regions[id]
    }

}


class Plate {
    constructor(id, origin) {
        this.id = id
        this.origin = origin
    }
}

