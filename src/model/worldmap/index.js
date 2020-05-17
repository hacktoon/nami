import Tile from './tile'
import { Grid } from '/lib/grid'
import { Name } from '/lib/name'
import { Random } from '/lib/random'

import { ReliefMap } from './geo/relief'
import { WaterMap } from './geo/water'
import { HeatMap } from './atm/heat'
import { MoistureMap } from './atm/moisture'
import { BiomeMap } from './bio/biome'


export default class WorldMap {
    constructor(config) {
        const {size, roughness, seed} = new WorldConfig(config)
        this.name = Name.createLandmassName()
        this.seed = seed
        this.size = size
        this.width = size
        this.height = size
        this.area = size * size
        this.grid = new Grid(size, size, point => new Tile(point))
        this.reliefMap = new ReliefMap(size, roughness)
    }

    get(point) {
        return this.grid.get(point)
    }

    getColor(point) {
        return this.reliefMap.codeMap.getColor(point)
    }
}


export class WorldConfig {
    static DEFAULT_ROUGHNESS = 8  // TODO: move attr to HeightMap
    static DEFAULT_SIZE = 257
    static get DEFAULT_SEED() { return Number(new Date()) }

    constructor(params={}) {
        const defaultParams = {
            size: WorldConfig.DEFAULT_SIZE,
            roughness: WorldConfig.DEFAULT_ROUGHNESS,
            seed: WorldConfig.DEFAULT_SEED
        }
        let config = Object.assign(defaultParams, params)

        this.seed = this._normalizeSeed(config.seed)
        this.roughness = Number(config.roughness)
        this.size = Number(config.size)
    }

    _normalizeSeed(seed='') {
        seed = String(seed).length ? seed : WorldConfig.DEFAULT_SEED
        Random.seed = seed
        return seed
    }
}