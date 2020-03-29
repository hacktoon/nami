import { Random } from '/lib/base'
import { Grid } from '/lib/grid'
import { FloodFill2 } from '/lib/flood-fill'

const EMPTY = -1


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
        this.grid = new Grid(config.size, config.size, () => EMPTY)
        this.count = config.count
        this.size = config.size
        this.fillers = {}
        this.regions = this._initRegions()
    }

    _initRegions() {
        const points = this._initPoints()
        const regions = {}
        for(let i=0; i<points.length; i++) {
            regions[i] = new Region(points[i])
            this.grid.set(points[i], String(i))
            this.fillers[i] = this._initRegionFiller(i)
        }
        return regions
    }

    _initPoints() {
        const points = []
        for(let i=0; i<this.count; i++) {
            const [x, y] = [Random.int(this.size), Random.int(this.size)]
            points.push(new Point(x, y))
        }
        return points
    }

    _initRegionFiller(index) {
        const onFill = point => this.grid.set(point, String(index))
        const isFillable = point => this.grid.get(point) === EMPTY
        return new FloodFill2(onFill, isFillable)
    }

    growAll() {
        for(let i=0; i<this.count; i++) {
            const currentLayer = this.regions[i].borderPoints()
            const newLayer = this.fillers[i].grow(currentLayer)
            this.regions[i].grow(newLayer)
        }
    }

    growRandom() {
        for(let i=0; i<this.count; i++) {
            const currentLayer = this.regions[i].borderPoints()
            const newLayer = this.fillers[i].growRandom(currentLayer)
            this.regions[i].grow(newLayer)
        }
    }

    getColor(point) {
        const index = this.grid.get(point)
        return {
            '-1': 'white',
            '0': 'green',
            '1': 'red',
            '2': 'blue',
            '3': 'brown',
            '4': 'yellow',
            '5': 'gray',
            '6': 'purple',
            '7': 'black'
        }[index]
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
        const config = Object.assign(defaultParams, params)

        this.count = config.count
        this.size = config.size
    }
}
