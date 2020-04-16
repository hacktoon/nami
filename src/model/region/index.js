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
    const regionMap = new RegionMap(regions, grid, fillers)
    while(totalArea < grid.area) {
        regionMap.grow(growth)
    }
    return regionMap
}


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

//=========================================
// APAGAR DAQUI PRA BAIXO
export class RegionMap {
    constructor(regions, grid, fillers) {
        this.grid = grid
        this.regions = regions
        this.fillers = fillers
    }

    get(point) {
        return this.grid.get(point)
    }

    grow(growth) {
        if(growth == 'organic') {
            this.organic()
        } else {
            this.normal()
        }
    }

    normal() {
        for(let i=0; i<this.regions.length; i++) {
            const currentLayer = this.regions[i].layer(-1)
            const newLayer = this.fillers[i].grow(currentLayer)
            this.regions[i] = this.regions[i].grow(newLayer)
        }
    }

    organic() {
        const chance = .2
        const times = () => Random.choice([5, 10, 20, 50, 60])
        let totalPoints = 0
        for(let i=0; i<this.regions.length; i++) {
            const region = this.regions[i]
            const filler = this.fillers[i]
            const topLayer = region.layer(-1)
            const newLayer = filler.growRandom(topLayer, chance, times())
            this.regions[i] = region.grow(newLayer)
            totalPoints += newLayer.length
        }
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