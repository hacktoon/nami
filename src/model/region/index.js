import { repeat } from '/lib/function'
import { sum } from '/lib/number'
import { Random } from '/lib/random'
import { Grid } from '/lib/grid'
import { OrganicFloodFill } from '/lib/flood-fill'
import { PointHash } from '/lib/point'
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


class MapLayer {
    constructor(regions, grid) {
        this.regions = regions
        this.grid = grid
    }
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


// FUNCTIONS ===================================

export function createRegionMap(params={}) {
    const {count, width, height, growth} = createConfig(params)
    const grid = new RegionGrid(width, height)
    const regions = createRegions(count, width, height)
    const fillers = regions.map((_, index) => {
        const onFill = point => grid.set(point, index)
        const isFillable = point => grid.isEmpty(point)
        return new OrganicFloodFill(onFill, isFillable)
    })
    const layers = [new MapLayer(regions, grid)]
    const regionMap = new RegionMap(regions, grid, layers)
    while(grid.hasEmptyPoints()) {
        const newRegions = null
        if(growth == 'organic') {
            newRegions = growOrganic(regions, fillers)
        } else {
            newRegions = growNormal(regions, fillers)
        }
        layers.push(new MapLayer(newRegions, grid))
    }
    return regionMap
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
        const center = createPoint()
        return new Region(id, center, [center])
    })
}


function growNormal(regions, fillers) {
    const newRegions = []
    for(let i=0; i<regions.length; i++) {
        const newPoints = fillers[i].grow(regions[i].points)
        newRegions.push(regions[i].grow(newPoints))
    }
    return newRegions
}


function growOrganic(regions, fillers) {
    let newRegions = []
    const chance = .2
    const times = () => Random.choice([5, 10, 20, 50, 60])
    for(let i=0; i<regions.length; i++) {
        const region = regions[i]
        const filler = fillers[i]
        const newPoints = filler.growRandom(region.points, chance, times())
        regions[i] = region.grow(newPoints)
        newRegions.push(regions[i])
    }
    return newRegions
}
