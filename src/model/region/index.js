import { Random } from '/lib/base'
import { Grid } from '/lib/grid'
import { FloodFill2 } from '/lib/flood-fill'

const EMPTY = 0
const CENTER = 1


export class Region {
    constructor(center) {
        this.center = center
        this.layers = [[center]]
    }

    grow(points) {
        this.layers.push(points)
    }

    points() {
        let _points = []
        for(let i=0; i<this.layers.length; i++) {
            _points = _points.concat(this.layers[i])
        }
        return _points
    }

    layerPoints(layerIndex) {
        return this.layers[layerIndex]
    }

    borderPoints() {
        return this.layers[this.layers.length - 1]
    }
}


export class RegionMap {
    constructor(params) {
        const config = new RegionMapConfig(params)
        this.grid = new Grid(config.size, config.size, () => 'white')
        this.count = config.count
        this.size = config.size
        this.fillers = {}
        this.regions = this._initRegions()
    }

    _initRegions() {
        const points = this._initPoints()
        let regions = {}
        for(let i=0; i<this.count; i++) {
            regions[i] = new Region(points[i])
            this.grid.set(points[i], 'green')
            this.fillers[i] = new FloodFill2()
        }
        return regions
    }

    _initPoints() {
        let points = []
        for(let i=0; i<this.count; i++) {
            points.push(new Point(Random.int(this.size), Random.int(this.size)))
        }
        return points
    }

    growAll() {
        for(let i=0; i<count; i++) {
            regions[i].grow([])
        }
    }

    growSome() {

    }

    getColor(point) {
        return this.grid.get(point)
    }
}


export class RegionMapConfig {
    static DEFAULT_COUNT = 5
    static DEFAULT_SIZE = 65

    constructor(params={}) {
        const defaultParams = {
            count: RegionMapConfig.DEFAULT_COUNT,
            size: RegionMapConfig.DEFAULT_SIZE
        }
        let config = Object.assign(defaultParams, params)

        this.count = config.count
        this.size = config.size
    }
}
