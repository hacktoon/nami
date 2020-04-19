import { repeat } from '/lib/function'
import { sum } from '/lib/number'
import { Random } from '/lib/random'
import { Grid } from '/lib/grid'
import { OrganicFloodFill } from '/lib/flood-fill'
import { PointHash, PointGroup } from '/lib/point'
import { Color } from '/lib/color'


export const EMPTY_GRID_POINT = -1
export const DEFAULT_COUNT = 15
export const DEFAULT_WIDTH = 150
export const DEFAULT_HEIGHT = 150


export class RegionMap {
    constructor(regions, grid, layers) {
        this.grid = grid
        this.regions = regions
        this.layers = layers
    }

    get(point) {
        const id = this.grid.get(point)
        return this.regions[id]
    }
}


function createConfig(params={}) {
    const defaultParams = {
        count: DEFAULT_COUNT,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        growth: 'organic',
    }
    return Object.assign(defaultParams, params)
}


function createRegions(count, width, height) {
    const createPoint = () => Point.random(width, height)
    return repeat(count, id => {
        const points = [createPoint()]
        return new Region(id, points, points[0])
    })
}

function normal(regions, fillers) {
    const newRegions = {}
    for(let i=0; i<regions.length; i++) {
        const currentLayer = regions[i].layer(-1)
        const newLayer = fillers[i].grow(currentLayer)
        newRegions[i] = regions[i].grow(newLayer)
    }
    return newRegions
}

function organic(regions, fillers) {
    const chance = .2
    const times = () => Random.choice([5, 10, 20, 50, 60])
    for(let i=0; i<regions.length; i++) {
        const region = regions[i]
        const filler = fillers[i]
        const topLayer = region.layer(-1)
        const newLayer = filler.growRandom(topLayer, chance, times())
        regions[i] = region.grow(newLayer)
    }
}


export function createRegionMap(params={}) {
    const {count, width, height, growth} = createConfig(params)
    const grid = new RegionGrid(width, height)
    const regions = createRegions(count, width, height)
    const fillers = regions.map((_, index) => {
        const onFill = point => grid.set(point, index)
        const isFillable = point => grid.isEmpty(point)
        return new OrganicFloodFill(onFill, isFillable)
    })
    const layers = []
    const regionMap = new RegionMap(regions, grid, layers)
    while(grid.hasEmptyPoints()) {
        if(growth == 'organic') {
            organic(regions, fillers)
        } else {
            normal(regions, fillers)
        }
    }
    return regionMap
}


class RegionGrid {
    constructor(width, height) {
        this.grid = new Grid(width, height, () => EMPTY_GRID_POINT)
        this.emptyPoints = width * height
    }

    set(point, value) {
        if (this.grid.get(point) != EMPTY_GRID_POINT) return
        this.grid.set(point, value)
        this.emptyPoints--
    }

    get(point) {
        return this.grid.get(point)
    }

    isEmpty(point) {
        return this.get(point) == EMPTY_GRID_POINT
    }

    hasEmptyPoints() {
        return this.emptyPoints > 0
    }
}


class Region {
    constructor(id, points, origin, baseLayers=[]) {
        this.id = id
        this.origin = origin
        this.color = new Color()
        this.layers = [...baseLayers, new PointGroup(points)]
    }

    get size() {
        return sum(this.layers.map(layer => layer.size))
    }

    get points() {
        return this.layers.reduce((prev, layer) => {
            return [...prev, ...layer.points()]
        }, [])
    }

    has(point) {
        for(let layer of this.layers) {
            if (layer.has(point)) return true
        }
        return false
    }

    layer(index) {
        const validIndex = index > 0 ? index : this.layers.length + index
        return this.layers[validIndex].points
    }

    layerIndex(point) {
        let index = 0
        for(let layer of this.layers) {
            if (layer.has(point)) return index
            index++
        }
        return index
    }

    inLayer(point, layer) {
        const index = layer > 0 ? layer : this.layers.length + layer
        return this.layerIndex(point) === index
    }

    grow(points) {
        return new Region(this.id, points, this.origin, this.layers)
    }
}


class MapLayer {
    constructor(regions, grid) {
        this.regions = regions
        this.grid = grid
    }
}

