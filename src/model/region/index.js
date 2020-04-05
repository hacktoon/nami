import { Random } from '/lib/random'
import { Grid } from '/lib/grid'
import { OrganicFloodFill } from '/lib/flood-fill'
import { PointGroup } from '/lib/point'
import { Color } from '/lib/color'


const EMPTY = -1


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
        return new OrganicFloodFill(onFill, isFillable)
    }

    grow() {
        for(let i=0; i<this.count; i++) {
            const currentLayer = this.regions[i].outerLayerPoints()
            const newLayer = this.fillers[i].grow(currentLayer)
            this.regions[i].grow(newLayer)
        }
    }

    growRandom() {
        const chance = .2
        const times = () => Random.choice([1, 2, 5, 10, 20])
        for(let i=0; i<this.count; i++) {
            const currentLayer = this.regions[i].outerLayerPoints()
            const newLayer = this.fillers[i].growRandom(
                currentLayer, chance, times()
            )
            this.regions[i].grow(newLayer)
        }
    }

    getColor(rawPoint) {
        const point = this.grid.wrap(rawPoint)
        const regionID = this.grid.get(point)
        const region = this.regions[regionID]

        if (regionID == EMPTY) return 'white'
        if (region.isCenter(point)) return 'black'
        if (region.inOuterLayer(point))
            return region.color.brighten(15).toHex()

        const layerIndex = region.layerIndex(point) * 5
        let amount = layerIndex
        //let amount = layerIndex % 2 ? -layerIndex : layerIndex
        return region.color.darken(amount).toHex()
    }
}


export class Region2 {
    constructor(points, baseLayers=[]) {
        this.topLayer = new PointGroup(points)
        this.baseLayers = baseLayers
        this.layers = [...baseLayers, this.topLayer]
    }

    get points() {
        const reducer = (prev, layer) => [...prev, ...layer.points]
        return this.layers.reduce(reducer, [])
    }

    get size() {
        const layerSizes = this.layers.map(layer => layer.size)
        return layerSizes.reduce((prev, current) => prev + current, 0)
    }

    get center() {
        return this.layers[0].center()
    }

    has(point) {
        if (this.topLayer.has(point)) return true
        for(let layer of this.layers) {
            if (layer.has(point)) return true
        }
        return false
    }

    grow(points) {
        return new Region2(points, this.layers)
    }

    layerPoints(index) {
        return this.layers[index].points
    }

    topLayerPoints() {
        return this.layerPoints(this.layers.length - 1)
    }

    isCenter(point) {
        return point.equals(this.center)
    }

    layerIndex(point) {
        return this.pointIndex[point.hash]
    }

    inLayer(point, layer) {
        return this.layerIndex(point) == layer
    }

    inOuterLayer(point) {
        return this.inLayer(point, this.layers.length - 1)
    }



}
window.Region2 = Region2


export class RegionMapConfig {
    static DEFAULT_COUNT = 15
    static DEFAULT_SIZE = 129

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


export class Region {
    constructor(grid, center) {
        this.grid = grid
        this.center = center
        this.layers = [[center]]
        this.color = new Color()
        this.pointIndex = {}
    }

    grow(points) {
        let wrappedPoints = []
        points.forEach(rawPoint => {
            const point = this.grid.wrap(rawPoint)
            if (! this.hasPoint(point)) {
                this.pointIndex[point.hash] = this.layers.length
                wrappedPoints.push(point)
            }
        })
        this.layers.push(wrappedPoints)
    }

    hasPoint(point) {
        return this.pointIndex.hasOwnProperty(point.hash)
    }

    isCenter(point) {
        return point.equals(this.center)
    }

    layerIndex(point) {
        return this.pointIndex[point.hash]
    }

    inLayer(point, layer) {
        return this.layerIndex(point) == layer
    }

    inOuterLayer(point) {
        return this.inLayer(point, this.layers.length - 1)
    }

    outerLayerPoints() {
        return this.layers[this.layers.length - 1]
    }
}