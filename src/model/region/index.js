import { Random } from '/lib/base'
import { Grid } from '/lib/grid'


const EMPTY = 0
const CENTER = 1
const defaultPoints = [
    new Point(5, 7),
    new Point(46, 12),
    new Point(10, 20),
    new Point(35, 1),
    new Point(20, 29),
]


export class Region {
    constructor(center) {
        this.center = center
        this.layers = []
        this.points = []
    }
}


export class RegionMap {
    constructor({count, size}) {
        this.grid = new Grid(size, size, 'white')
        this.count = count
        this.size = size
        this.regions = this.constructorRegions(count)
    }

    constructorRegions(count) {
        let regions = []
        for(let i=0; i<count; i++) {
            const point = defaultPoints[i]
            regions.push(new Region(point))
            this.grid.set(point, 'black')
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
