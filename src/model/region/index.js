import { repeat } from '/lib/function'
import { Random } from '/lib/random'
import { normalFill, OrganicFloodFill } from '/lib/flood-fill'
import { PointHash } from '/lib/point'
import { Color } from '/lib/color'
import { RegionGrid } from './grid'


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


class MapLayer {
    constructor(regions) {
        this.regions = regions
    }
}


class Region {
    constructor(id, origin, points) {
        this.id = id
        this.origin = origin
        this.pointHash = new PointHash(points)
        this.color = new Color()
    }

    get size() {
        return this.pointHash.size
    }

    get points() {
        return this.pointHash.points
    }

    isCenter(point) {
        return this.origin.equals(point)
    }

    has(point) {
        return this.pointHash.has(point)
    }

    grow(points) {
        return new Region(this.id, this.origin, points)
    }
}


class GridFillRules {
    constructor(grid) {
        this.grid = grid
        this.chance = .2
        this.growthRate = [5, 10, 20, 50, 60]
    }

    times() {
        return Random.choice(this.growthRate)
    }

    canFill(point) {
        return this.grid.isEmpty(point)
    }

    fill(point, value) {
        return this.grid.set(point, value)
    }

    isBorder(point, value) {
        return this.grid.get(point) != value
    }
}


// FUNCTIONS ===================================

export function createRegionMap(params={}) {
    const {count, width, height, growth} = createConfig(params)
    const grid = new RegionGrid(width, height)
    const regions = createRegions(count, width, height)
    const layers = createLayers(regions, growth, grid)
    return new RegionMap(regions, grid, layers)
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


// CREATE REGIONS ===================================================
function createRegions(count, width, height) {
    const createPoint = () => Point.random(width, height)
    return repeat(count, id => {
        const center = createPoint()
        return new Region(id, center, [center])
    })
}


// CREATE LAYERS FROM REGIONS =======================================
function createLayers(regions, growth, grid) {
    const layers = [new MapLayer(regions)]
    const fillers = regions.map((_, index) => {
        const onFill = point => grid.set(point, index)
        const isFillable = point => grid.isEmpty(point)
        const rules = new GridFillRules(grid)
        return new OrganicFloodFill(onFill, isFillable)
    })

    while(grid.hasEmptyPoints()) {
        const grow = growth === 'organic' ? growOrganic : growNormal
        const layer = new MapLayer(newRegions)
        const newRegions = grow(layer, regions, fillers)
        layers.push(layer)
    }
    return layers
}


// REGIONS GROW FUNCTIONS ===========================================
function growNormal(layer, regions) {
    const newRegions = []
    for(let i=0; i<regions.length; i++) {
        const newPoints = normalFill(regions[i].points)
        newRegions.push(regions[i].grow(newPoints))
    }
    return newRegions
}


function growOrganic(layer, regions, fillers) {
    let newRegions = []
    const chance = .2
    const times = () => Random.int(70)
    for(let i=0; i<regions.length; i++) {
        const region = regions[i]
        const newPoints = fillers[i].growRandom(region.points, chance, times())
        regions[i] = region.grow(newPoints)
        newRegions.push(regions[i])
    }
    return newRegions
}
