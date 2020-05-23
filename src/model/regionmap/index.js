import { repeat } from '/lib/function'
import { Random } from '/lib/random'
import { OrganicFill } from '/lib/flood-fill'
import { PointHash } from '/lib/point'
import { RegionGrid } from '/lib/grid/region'

export const DEFAULT_COUNT = 15
export const DEFAULT_WIDTH = 150
export const DEFAULT_HEIGHT = 150
export const DEFAULT_SEED = 'a'


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
    constructor(id, origin, grid) {
        this.id = id
        this.origin = origin
        this.organicFill = createOrganicFill(id, origin, grid)
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
    const {seed, count, width, height} = createConfig(params)
    const grid = new RegionGrid(width, height)
    const points = createPoints(count, width, height)
    const regions = createRegions(points, grid)
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
        seed: DEFAULT_SEED
    }, params)
    config.seed = _normalizeSeed(config.seed)
    return config
}


function createPoints(count, width, height) {
    return repeat(count, () => Point.random(width, height))
}


function createRegions(points, grid) {
    return points.map((point, id) => new Region(id, point, grid))
}


function createOrganicFill(id, originPoint, grid) {
    return new OrganicFill(originPoint, {
        setBorder:  point => grid.setBorder(point),
        setOrigin:  point => grid.setOrigin(point),
        setSeed:    point => grid.setSeed(point, id),
        setValue:   point => grid.setValue(point, id),
        setLayer:   (point, layer) => grid.setLayer(point, layer),
        isEmpty:    point => grid.isEmpty(point),
        isSeed:     point => grid.isSeed(point, id),
        isBlocked:  point => grid.isBlocked(point, id),
        maxFills:   50,
        fillChance: .1,
    })
}