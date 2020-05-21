import { repeat } from '/lib/function'
import { Random } from '/lib/random'
import { RegionGrid } from '/lib/grid/region'
import { Region } from '/model/region'


export const DEFAULT_COUNT = 1
export const DEFAULT_WIDTH = 150
export const DEFAULT_HEIGHT = 150


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

    isBorder(point) {
        return this.grid.isBorder(point)
    }

    getLayer(point) {
        return this.grid.getLayer(point)
    }
}


// FUNCTIONS ===================================

export function createRegionMap(params={}) {
    const {count, width, height, seed} = createConfig(params)
    const points = createPoints(count, width, height)
    const grid = new RegionGrid(width, height)
    const regions = createRegions(points, grid)
    let layer = 0
    while(grid.hasEmptyPoints()) {
        growRegions(layer++, regions)
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
        seed: ''
    }, params)
    config.seed = _normalizeSeed(config.seed)
    return config
}


function createPoints(count, width, height) {
    return repeat(count, () => Point.random(width, height))
}


function createRegions(points, grid) {
    return points.map((point, id) => {
        grid.setOrigin(point)
        return new Region(id, point, grid)
    })
}


function growRegions(layer, regions) {
    for(let region of regions) {
        const [filled, seeds] = region.grow(layer)
        if (filled.length <= 12)
            console.log(`baseseeds ${region.seeds.length}, filled ${filled.length}, seeds ${seeds.length}`);
        region.addSeeds(seeds)
    }
}