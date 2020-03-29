import { Random } from '/lib/base'
import { RandomColor } from '/lib/color'
import { Grid } from '/lib/grid'
import { FloodFill2 } from '/lib/flood-fill'

const EMPTY = -1


export class Region {
    constructor(grid, center) {
        this.grid = grid
        this.center = center
        this.layers = [[center]]
        this.color = RandomColor()
        this.pointIndex = {}
    }

    grow(points) {
        let wrappedPoints = []
        points.forEach(rawPoint => {
            const point = this.grid.wrap(rawPoint)
            this.pointIndex[point.hash()] = this.layers.length
            wrappedPoints.push(point)
        })
        this.layers.push(wrappedPoints)
    }

    points() {
        let _points = []
        for(let i=0; i<this.layers.length; i++) {
            _points = _points.concat(this.layers[i])
        }
        return _points
    }

    hasPoint(point) {
        return Boolean(this.pointIndex[point.hash()])
    }

    isCenter(point) {
        return point.equals(this.center)
    }

    inLayer(point, layer) {
        return this.pointIndex[point.hash()] == layer
    }

    inOuterLayer(point) {
        return this.inLayer(point, this.layers.length - 1)
    }

    layerPoints(layerIndex) {
        return this.layers[layerIndex]
    }

    outerLayer() {
        return this.layers[this.layers.length - 1]
    }

    distFromCenter(point) {
        return Point.euclidianDistance(this.center, point)
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
            regions[i] = new Region(this.grid, points[i])
            this.grid.set(points[i], i)
            this.fillers[i] = this._initRegionFiller(i)
        }
        return regions
    }

    _initPoints() {
        const points = []
        for(let i=0; i<this.count; i++) {
            const rand = () => Random.int(this.size-1)
            points.push(new Point(rand(), rand()))
        }
        return points
    }

    _initRegionFiller(index) {
        const onFill = point => this.grid.set(point, index)
        const isFillable = point => this.grid.get(point) === EMPTY
        return new FloodFill2(onFill, isFillable)
    }

    growAll() {
        for(let i=0; i<this.count; i++) {
            const currentLayer = this.regions[i].outerLayer()
            const newLayer = this.fillers[i].grow(currentLayer)
            this.regions[i].grow(newLayer)
        }
    }

    growRandom() {
        for(let i=0; i<this.count; i++) {
            const currentLayer = this.regions[i].outerLayer()
            const newLayer = this.fillers[i].growRandom(currentLayer)
            this.regions[i].grow(newLayer)
        }
    }

    getColor(point) {
        const index = this.grid.get(point)
        if (index == EMPTY) return 'white'

        const gridPoint = this.grid.wrap(point)
        const region = this.regions[index]
        if (region.isCenter(gridPoint)) return 'black'
        if (region.inOuterLayer(gridPoint)) return 'red'

        return region.color
    }
}


export class RegionMapConfig {
    static DEFAULT_COUNT = 7
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
