import Tile from './tile'
import { Grid } from '/lib/grid'
import { Name } from '/lib/name'
import { Random } from '/lib/base'

import { ReliefMap } from './geo/relief'
import { WaterMap } from './geo/water'
import { HeatMap } from './atm/heat'
import { MoistureMap } from './atm/moisture'
import { BiomeMap } from './bio/biome'


export class WorldConfig {
    static DEFAULT_ROUGHNESS = 8  // TODO: move attr to HeightMap
    static DEFAULT_SIZE = 257
    static get DEFAULT_SEED () { return Number(new Date()) }

    constructor(params={}) {
        let config = Object.assign({}, this.defaultParams, params)
        this.seed = this.constructorSeed(config.seed)
        this.roughness = config.roughness
        this.size = config.size
    }

    constructorSeed(value) {
        const defaultSeed = WorldConfig.DEFAULT_SEED
        const seed = String(value).length ? value : defaultSeed
        Random.seed = seed
        return seed
    }

    get defaultParams() {
        return {
            size: WorldConfig.DEFAULT_SIZE,
            roughness: WorldConfig.DEFAULT_ROUGHNESS,
            seed: WorldConfig.DEFAULT_SEED
        }
    }
}


export default class World {
    constructor(config=new WorldConfig()) {
        const {size, roughness, seed} = config
        this.name = Name.createLandmassName()
        this.seed = seed
        this.size = size
        this.area = size * size
        this.grid = new Grid(size, size, point => new Tile(point))
        this.reliefMap = new ReliefMap(size, roughness)
    }

    iter(callback) {
        this.grid.forEach(callback)
    }

    get(point) {
        return this.grid.get(point)
    }
}