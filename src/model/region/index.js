import { Random } from '/lib/base'
import { Grid } from '/lib/grid'


const EMPTY = 0
const CENTER = 1

export class Region {
    constructor(center) {
        this.center = center
        this.layers = []
        this.points = []
    }
}


export class RegionMap {
    constructor({count, size}) {
        const grid = new Grid(size, size, 'white')

        this.count = count
        this.grid = grid
        this.size = size
        this.regions = this.constructorRegions(grid, count)
    }

    constructorRegions(grid, count) {
        let regions = []
        for(let i=0; i<count; i++) {
            const centerPoint = new Point(Random.int(30), Random.int(20))
            regions.push(new Region(centerPoint))
            grid.set(centerPoint, 'black')
        }
        return regions
    }

    getColor(point) {
        return this.grid.get(point)
    }
}


export class RegionMapConfig {
    static DEFAULT_POINTS = 5
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
