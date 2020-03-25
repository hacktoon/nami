import { Random } from '/lib/base'
import { Grid } from '/lib/grid'


const EMPTY = 0
const CENTER = 1


export class Region {
    constructor(center) {
        this.center = center
        this.layers = layers
        this.points = points
    }
}


export class RegionMap {
    constructor({count, size}) {
        this.grid = new Grid(size, size, () => {
            return Random.choice(['green', 'blue', 'darkblue'])
        })
        this.count = count
        this.size = size
    }

    getColor(point) {
        return this.grid.get(point)
    }
}


export class RegionMapConfig {
    static DEFAULT_POINTS = 6
    static DEFAULT_SIZE = 257

    constructor(params={}) {
        const defaultParams = {
            count: RegionMapConfig.DEFAULT_POINTS,
            size: RegionMapConfig.DEFAULT_SIZE
        }
        let config = Object.assign(defaultParams, params)

        this.count = config.count || 1
        this.size = config.size
    }
}
