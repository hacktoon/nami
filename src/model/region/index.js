import { Grid } from '/lib/grid'
import { LightFloodFill } from '/lib/flood-fill'

import { Region } from './region'


const EMPTY = -1



function grow(point, testPoint) {
    return point.adjacents(testPoint)
}

function organic(point, testPoint) {
    const grown = point.adjacents()
    const final = [...grown]
    grown.forEach(point => {
        if (Random.chance(.5)) {
            final = PointGrowth.normal(point)
        }
    })
}


export class RegionMap {
    constructor(params) {
        const config = new RegionMapConfig(params)
        this.grid = new Grid(config.size, config.size, () => EMPTY)
        this.count = config.count
        this.size = config.size
        this.width = config.size
        this.height = config.size
        this.fillers = {}
        this.regions = this._initRegions()
    }

    toGrid() {
        let grid = new Grid(this.width, this.height, () => EMPTY)
        return grid
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
            points.push(Point.random(this.size))
        }
        return points
    }

    _initRegionFiller(index) {
        const onFill = point => this.grid.set(point, index)
        const isFillable = point => this.grid.get(point) === EMPTY
        return new LightFloodFill(onFill, isFillable)
    }

    grow() {
        for(let i=0; i<this.count; i++) {
            const currentLayer = this.regions[i].outerLayerPoints()
            const newLayer = this.fillers[i].grow(currentLayer)
            this.regions[i].grow(newLayer)
        }
    }

    growRandom() {
        for(let i=0; i<this.count; i++) {
            const currentLayer = this.regions[i].outerLayerPoints()
            const newLayer = this.fillers[i].growRandom(currentLayer)
            this.regions[i].grow(newLayer)
        }
    }

    getColor(rawPoint) {
        const point = this.grid.wrap(rawPoint)
        const regionID = this.grid.get(point)
        const region = this.regions[regionID]

        if (regionID == EMPTY) return 'white'
        if (region.isCenter(point)) return 'black'
        if (region.inOuterLayer(point)) return 'red'

        let amount = region.layerIndex(point) * 5
        return region.color.darken(amount).toHex()
    }
}


export class RegionMapConfig {
    static DEFAULT_COUNT = 12
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
