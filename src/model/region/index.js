import { repeat, sum } from '/lib/function'
import { Random } from '/lib/random'
import { Grid } from '/lib/grid'
import { OrganicFloodFill } from '/lib/flood-fill'
import { PointGroup } from '/lib/point'


export const EMPTY = -1

export const DEFAULT_COUNT = 50
export const DEFAULT_WIDTH = 120
export const DEFAULT_HEIGHT = 100


function createConfig(params={}) {
    const defaultParams = {
        count: DEFAULT_COUNT,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT
    }
    return Object.assign(defaultParams, params)
}


function createRegions(count, width, height) {
    return repeat(count, () => new Region([Point.random(width, height)]))
}


export function createRegionMap(params={}) {
    const {count, width, height, growth} = createConfig(params)
    const grid = new Grid(width, height, () => EMPTY)
    const frames = []
    const regions = createRegions(count, width, height)
    // while(regions.size != 0) {
    //     frames.push(regions)
    // }
    // return new RegionMap(frames, grid)
    const fillers = regions.map((_, index) => {
        const onFill = point => grid.set(point, index)
        const isFillable = point => grid.get(point) === EMPTY
        return new OrganicFloodFill(onFill, isFillable)
    })
    return new RegionMap(regions, grid, fillers)
}


export class RegionMap {
    constructor(regions, grid, fillers) {
        this.grid = grid
        this.regions = regions
        this.frames = [regions]
        this.fillers = fillers
    }

    grow(mode) {

    }

    _grow() {
        for(let i=0; i<this.regions.length; i++) {
            const currentLayer = this.regions[i].layer(-1)
            const newLayer = this.fillers[i].grow(currentLayer)
            this.regions[i] = this.regions[i].grow(newLayer)
        }
    }

    growRandom() {
        const chance = .2
        const times = () => Random.int(10)
        let totalPoints = 0
        for(let i=0; i<this.regions.length; i++) {
            const filler = this.fillers[i]
            const topLayer = this.regions[i].layer(-1)
            const newLayer = filler.growRandom(topLayer, chance, times())
            this.regions[i] = this.regions[i].grow(newLayer)
            totalPoints += newLayer.length
        }
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

    borders() {
        return
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