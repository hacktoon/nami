import { repeat } from '/lib/function'
import { Random } from '/lib/random'
import { OrganicFill } from '/lib/flood-fill'
import { PointHash } from '/lib/point'
import { RegionGrid } from '/lib/grid/region'

export const DEFAULT_COUNT = 300
export const DEFAULT_WIDTH = 200
export const DEFAULT_HEIGHT = 150
export const DEFAULT_SEED = 'a'
export const DEFAULT_LAYER_GROWTH = 20


class RegionMap {
    constructor(seed, regions, grid) {
        this.width = grid.width
        this.height = grid.height
        this.regions = regions
        this.seed = seed
        this.grid = grid
    }

    get(point) {
        const id = this.grid.get(point).value
        return this.regions[id]
    }

    isOrigin(point) {
        return this.grid.isOrigin(point)
    }

    isSeed(point, value) {
        if (this.isEmpty(point))
            return false
        return this.grid.isSeed(point, value)
    }

    isEmpty(point) {
        return this.grid.isEmpty(point)
    }

    isBorder(point) {
        return this.grid.isBorder(point)
    }

    getLayer(point) {
        return this.grid.getLayer(point)
    }

    isLayer(point, layer) {
        return this.grid.isLayer(point, layer)
    }

    overLayer(point, layer) {
        return this.getLayer(point) > layer
    }
}


class Region {
    constructor(id, origin, grid, layerGrowth) {
        this.id = id
        this.origin = origin
        this.organicFill = createOrganicFill({
            id, origin, grid, layerGrowth
        })
        this.pointHash = new PointHash([origin])
    }

    get size() {
        return this.pointHash.size
    }

    get points() {
        return this.pointHash.points
    }

    has(point) {
        return this.pointHash.has(point)
    }

    grow() {
        const filled = this.organicFill.fill()
        this.pointHash.add(filled)
    }
}


// FUNCTIONS ===================================

export function createRegionMap(params={}) {
    const {seed, count, width, height, layerGrowth} = createConfig(params)
    const grid = new RegionGrid(width, height)
    const points = createPoints(count, width, height)
    const regions = createRegions(points, grid, layerGrowth)
    while(grid.hasEmptyPoints()) {
        regions.forEach(region => region.grow())
    }
    return new RegionMap(seed, regions, grid)
}


function createConfig(params={}) {
    function _normalizeSeed(seed) {
        seed = String(seed).length ? seed : Number(new Date())
        Random.seed = seed
        return seed
    }

    const config = Object.assign({
        count: DEFAULT_COUNT,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        seed: DEFAULT_SEED,
        layerGrowth: DEFAULT_LAYER_GROWTH
    }, params)
    config.seed = _normalizeSeed(config.seed)
    return config
}


function createPoints(count, width, height) {
    return repeat(count, () => Point.random(width, height))
}


function createRegions(points, grid, layerGrowth) {
    return points.map((point, id) => new Region(id, point, grid, layerGrowth))
}


function createOrganicFill({
        id,
        origin,
        grid,
        layerGrowth
    }) {
    return new OrganicFill(origin, {
        setBorder:  point => grid.setBorder(point),
        setOrigin:  point => grid.setOrigin(point),
        setSeed:    point => grid.setSeed(point, id),
        setValue:   point => grid.setValue(point, id),
        setLayer:   (point, layer) => grid.setLayer(point, layer),
        isEmpty:    point => grid.isEmpty(point),
        isSeed:     point => grid.isSeed(point, id),
        isBlocked:  point => grid.isBlocked(point, id),
        layerGrowth:  layerGrowth,
        fillChance: Random.choice([.4, .2, .1, .08, .04, .02]),
    })
}