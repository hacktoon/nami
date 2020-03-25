import { Random } from '/lib/base'
import { Grid } from '/lib/grid'


export class Region {
    constructor(center) {
        this.center = center
        this.layers = layers
        this.points = points
    }
}


export class Regions {
    constructor(config) {
        this.grid = new Grid(config.size, config.size, () => {
            return Random.choice(['green', 'blue', 'darkblue'])
        })
        this.count = config.count
    }

    getColor(point) {
        return this.grid.get(point)
    }
}


export class RegionsConfig {
    static DEFAULT_POINTS = 5
    static DEFAULT_SIZE = 257

    constructor(params={}) {
        const defaultParams = {
            count: RegionsConfig.DEFAULT_POINTS,
            size: RegionsConfig.DEFAULT_SIZE
        }
        let config = Object.assign(defaultParams, params)

        this.count = config.count || 1
        this.size = config.size
    }
}
