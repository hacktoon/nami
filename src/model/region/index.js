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

    isOrigin(point) {
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
        // const rules = new GridFillRules(grid)
        return new OrganicFloodFill(onFill, isFillable)
    })

    while(grid.hasEmptyPoints()) {
        const grow = growth === 'organic' ? growOrganic : growNormal
        const newRegions = grow(layer, regions, fillers)
        const layer = new MapLayer(newRegions)
        layers.push(layer)
    }
    return layers
}


// REGIONS GROW FUNCTIONS ===========================================
function growNormal(layer, regions) {
    const newRegions = []
    for(let region of regions) {
        const newPoints = normalFill(region.points)
        newRegions.push(region.grow(newPoints))
    }
    return newRegions
}


function growOrganic(layer, regions, fillers) {
    let newRegions = []
    for(let region of regions) {
        const rules = {
            points: region.points,
            times: Random.int(80),
            chance: .2,
        }
        const newPoints = fillers[region.id].growRandom(rules)
        regions[region.id] = region.grow(newPoints)
        newRegions.push(regions[region.id])
    }
    return newRegions
}
