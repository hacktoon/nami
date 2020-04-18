import { repeat } from '/lib/function'
import { sum } from '/lib/number'
import { Random } from '/lib/random'
import { Grid } from '/lib/grid'
import { OrganicFloodFill } from '/lib/flood-fill'
import { PointHash, PointGroup } from '/lib/point'


export const EMPTY = -1

export const DEFAULT_COUNT = 15
export const DEFAULT_WIDTH = 250
export const DEFAULT_HEIGHT = 250


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
    return repeat(count, () => {
        const points = [createPoint()]
        return new RegionHistory(points, points[0])
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
    const grid = new Grid(width, height, () => EMPTY)
    const regions = createRegions(count, width, height)
    let totalArea = 0
    const fillers = regions.map((_, index) => {
        const onFill = point => {
            grid.set(point, index)
            totalArea++
        }
        const isFillable = point => grid.get(point) === EMPTY
        return new OrganicFloodFill(onFill, isFillable)
    })
    const regionMap = new RegionMap(regions, grid)
    while(totalArea < grid.area) {
        if(growth == 'organic') {
            organic(regions, fillers)
        } else {
            normal(regions, fillers)
        }
    }
    return regionMap
}

/*
// =========================== WIP
export function createRegionMap2(params={}) {
    let totalArea = 0
    const {count, width, height, growth} = createConfig(params)
    const grid = new Grid(width, height, () => EMPTY)
    const regions = createRegions2(count, width, height)
    const fillers = regions.map((_, index) => {
        const onFill = point => {
            grid.set(point, index)
            totalArea++
        }
        const isFillable = point => grid.get(point) === EMPTY
        return new OrganicFloodFill(onFill, isFillable)
    })
    const originLayer = new RegionMapLayer(regions, grid)
    const layers = [originLayer]
    while(totalArea < grid.area) {
        const newRegions = regions.map(region => region.grow(growth))
        layers.push(new RegionMapLayer(newRegions, grid))
    }
    return new RegionMap2(layers, grid)
}


function createRegions2(count, width, height) {
    const points = repeat(count, () => Point.random(width, height))
    return points.map(point => new Region([point], point))
}


export class RegionMap2 {
    constructor(layers, grid) {
        this.layers = layers
        this.grid = grid
    }
}


export class RegionMapLayer {
    constructor(regions, grid) {
        this.regions = regions
        this.grid = grid
    }
}


export class Region {
    constructor(origin, points) {
        this.origin = origin
        this.hash = new PointHash(points)
    }
}
*/



//=========================================
export class RegionMap {
    constructor(regions, grid) {
        this.grid = grid
        this.regions = regions
    }

    get(point) {
        return this.grid.get(point)
    }
}


export class RegionHistory {
    constructor(points, origin, baseLayers=[]) {
        this.layers = [...baseLayers, new PointGroup(points)]
        this.origin = origin
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
        return new RegionHistory(points, this.origin, this.layers)
    }
}