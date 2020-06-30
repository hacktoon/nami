import { repeat } from '/lib/function'
import { Random } from '/lib/random'
import { OrganicFill } from '/lib/flood-fill'
import { RegionGrid } from '/lib/grid/region'
import { Region } from './region'
import { RegionMapImage } from './image'


export const DEFAULT_COUNT = 10
export const DEFAULT_WIDTH = 200
export const DEFAULT_HEIGHT = 150
export const DEFAULT_SEED = ''
export const DEFAULT_LAYER_GROWTH = 40
export const DEFAULT_GROWTH_CHANCE = .1



class RegionMap {
    constructor(seed, regions, grid) {
        this.regions = regions
        this.seed = seed
        this.grid = grid
        this.image = new RegionMapImage(this)
    }

    get width() {
        return this.grid.width
    }

    get height() {
        return this.grid.height
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

    isOverLayer(point, layer) {
        return this.getLayer(point) > layer
    }
}


class RegionMapSpec {
    constructor(regionMap) {
        this.regionMap = regionMap
    }

    width() {

    }
}



// FUNCTIONS ===================================


export function createRegionMap(params={}) {
    const {
        seed, count, width, height, layerGrowth, growthChance
    } = createConfig(params)
    const grid = new RegionGrid(width, height)
    const points = createPoints(count, width, height)
    const regions = createRegions(points, grid, layerGrowth, growthChance)
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
        layerGrowth: DEFAULT_LAYER_GROWTH,
        growthChance: DEFAULT_GROWTH_CHANCE
    }, params)
    config.seed = _normalizeSeed(config.seed)
    return config
}


function createPoints(count, width, height) {
    return repeat(count, () => Point.random(width, height))
}


function createRegions(points, grid, layerGrowth, growthChance) {
    return points.map((origin, id) => {
        const organicFill = createOrganicFill({
            id, origin, grid, layerGrowth, growthChance
        })
        return new Region(id, origin, organicFill)
    })
}


function createOrganicFill({
        id,
        origin,
        grid,
        layerGrowth,
        growthChance
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
        layerGrowth,
        growthChance,
    })
}