import { Random } from '/lib/random'
import { Grid } from '/lib/grid'


export const DEFAULT_RESOLUTION = 5
export const DEFAULT_WIDTH = 150
export const DEFAULT_HEIGHT = 150


class HeightMap {
    constructor(seed, grid, resolution) {
        this.seed = seed
        this.grid = grid
        this.resolution = resolution
        this.width = grid.width
        this.height = grid.height
    }

    get(point) {
        const height = this.grid.get(point)
        return height
    }
}


// FUNCTIONS ===================================

export function createHeightMap(params={}) {
    const {resolution, width, height, seed} = createConfig(params)
    const grid = new Grid(width, height)

    return new HeightMap(seed, grid, resolution)
}


function createConfig(params={}) {
    function _normalizeSeed(seed) {
        seed = String(seed).length ? seed : Number(new Date())
        Random.seed = seed
        return seed
    }

    const config = Object.assign({
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        resolution: DEFAULT_RESOLUTION,
        seed: '',
    }, params)
    config.seed = _normalizeSeed(config.seed)
    return config
}
