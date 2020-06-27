import { Random } from '/lib/random'
import { Direction } from '/lib/direction'
import { Grid } from '/lib/grid'

import { createRegionMap } from '/model/regionmap'


export const CONTINENTAL_PLATE = 1
export const OCEANIC_PLATE = 2

export const DEFAULT_WIDTH = 200
export const DEFAULT_HEIGHT = 150
export const DEFAULT_COUNT = 14
export const DEFAULT_SEED = ''


export class TectonicMap {
    constructor(seed, plates, grid) {
        this.grid = grid
        this.width = grid.width
        this.height = grid.height
        this.plates = plates
        this.seed = seed
    }

    get(point) {
        const id = this.grid.get(point).value
        return this.plates[id]
    }

}


class Plate {
    constructor(id, type) {
        this.id = id
        this.type = type
        this.direction = Direction.randomCardinal()
        this.speed = Random.choice([1, 2, 3, 4])
    }
}


export function createTectonicMap(params={}) {
    const {seed, width, height} = createConfig(params)
    const regionMap = createRegionMap({width, height, seed})
    const grid = new Grid(width, height)
    const plates = createPlates(regionMap.regions, grid)

    return new TectonicMap(seed, plates, grid)
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


function createPlates(regions, grid) {
    return regions.map((region, id) => {
        return new Plate(id)
    })
}