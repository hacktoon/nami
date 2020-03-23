import { Random } from '/lib/base'
import { Grid } from '/lib/grid'


export class RegionsConfig {
    static DEFAULT_POINTS = 5
    static DEFAULT_SIZE = 257

    constructor(params={}) {
        const defaultParams = {
            points: RegionsConfig.DEFAULT_POINTS,
            size: RegionsConfig.DEFAULT_SIZE
        }
        let config = Object.assign(defaultParams, params)

        this.points = config.points
        this.size = config.size
    }

}


export class Region {
    constructor(points) {
        this.points = points
    }
}


export class Regions {
    constructor(config) {
        this.points = config.points || 1
        this.grid = new Grid(config.size, config.size, () => Random.choice(['green', 'blue']))
    }
}