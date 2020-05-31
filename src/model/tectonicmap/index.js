import { Random } from '/lib/random'


export const DEFAULT_WIDTH = 200
export const DEFAULT_HEIGHT = 150
export const DEFAULT_COUNT = 14
export const DEFAULT_SEED = ''


export class TectonicMap {
    constructor(seed, regionMap) {
        // this.width = grid.width
        // this.height = grid.height
        this.regionMap = regionMap
        this.seed = seed
    }

    get(point) {
        const id = this.grid.get(point).value
        return this.regions[id]
    }

}


class Plate {
    constructor(id, origin) {
        this.id = id
        this.origin = origin
    }
}


export function createTectonicMap(params={}) {
    const {seed, width, height} = createConfig(params)

    return new TectonicMap(seed, null)
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
        count: DEFAULT_COUNT,
        seed: DEFAULT_SEED,
    }, params)
    config.seed = _normalizeSeed(config.seed)
    return config
}