import { repeat, sum } from '/lib/function'
import { Random } from '/lib/random'
import { Grid } from '/lib/grid'
import { OrganicFloodFill } from '/lib/flood-fill'
import { PointGroup } from '/lib/point'
import { Color } from '/lib/color'


const EMPTY = -1


export class RegionMap2 {
    constructor(width, height, regions) {
        this.grid = new Grid(width, height, () => EMPTY)
        this.width  = width
        this.height = height
        this.regions = regions
    }
}


export class RegionMapFrame {
    constructor(regions) {
        this.regions = regions
    }

    get size() {
        return this.pointGroup.size
    }

    get points() {
        return this.regions.reduce((prevPoints, region) => {
            return [...prevPoints, ...region.points]
        }, [])
    }

    has(point) {
        for(let region of this.regions) {
            if (region.has(point)) return true
        }
        return false
    }

    grow(callback) {
        const regions = this.regions.map(region => {
            return region.grow(callback(region.points))
        })
        return new RegionMapFrame(regions)
    }
}


export class Region2 {
    constructor(points, center) {
        this.pointGroup = new PointGroup(points)
        this.center     = center
    }

    get size() {
        return this.pointGroup.size
    }

    get points() {
        return this.pointGroup.points
    }

    has(point) {
        this.pointGroup.has(point)
    }

    isCenter(point) {
        return this.center.equals(point)
    }

    grow(points) {
        return new Region(points, this.center)
    }
}


export class RegionMap {
    constructor(params) {
        const config = new RegionMapConfig(params)
        this.grid = new Grid(config.size, config.size, () => EMPTY)
        this.count = config.count
        this.size = config.size
        this.width = config.size
        this.height = config.size
        this.points = repeat(this.count, () => Point.random(this.size))
        this.colors = this.points.map(() => new Color())
        this.regions = this.points.map(point => new Region([point]))
        this.fillers = this.points.map((_, index) => {
            const onFill = point => this.grid.set(point, index)
            const isFillable = point => this.grid.get(point) === EMPTY
            return new OrganicFloodFill(onFill, isFillable)
        })
    }

    grow() {
        for(let i=0; i<this.count; i++) {
            const currentLayer = this.regions[i].layer(-1)
            const newLayer = this.fillers[i].grow(currentLayer)
            this.regions[i] = this.regions[i].grow(newLayer)
        }
    }

    growRandom() {
        const chance = .2
        const times = () => Random.int(20)
        let totalPoints = 0
        for(let i=0; i<this.count; i++) {
            const filler = this.fillers[i]
            const topLayer = this.regions[i].layer(-1)
            const newLayer = filler.growRandom(topLayer, chance, times())
            this.regions[i] = this.regions[i].grow(newLayer)
            totalPoints += newLayer.length
        }
    }

    getColor(point) {
        const regionID = this.grid.get(point)
        const region = this.regions[regionID]
        const color = this.colors[regionID]

        if (regionID == EMPTY) return 'white'
        if (region.isCenter(point)) return 'black'
        const layerIndex = region.layerIndex(this.grid.wrap(point))
        let amount = layerIndex * 10
        //let amount = layerIndex % 2 ? -layerIndex : layerIndex
        return color.darken(amount).toHex()
    }
}


export class Region {
    constructor(points, baseLayers=[]) {
        this.layers = [...baseLayers, new PointGroup(points)]
        this.center = this.layers[0].center
    }

    get size() {
        return sum(this.layers.map(layer => layer.size))
    }

    get points() {
        return this.layers.reduce((prev, layer) => {
            return [...prev, ...layer.points()]
        }, [])
    }

    layer(index) {
        const validIndex = index > 0 ? index : this.layers.length + index
        return this.layers[validIndex].points
    }

    has(point) {
        for(let layer of this.layers) {
            if (layer.has(point)) return true
        }
        return false
    }

    layerIndex(point) {
        let index = 0
        for(let layer of this.layers) {
            if (layer.has(point)) return index
            index++
        }
        return index
    }

    isCenter(point) {
        return point.equals(this.center)
    }

    inLayer(point, layer) {
        const index = layer > 0 ? layer : this.layers.length + layer
        return this.layerIndex(point) === index
    }

    grow(points) {
        return new Region(points, this.layers)
    }
}


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