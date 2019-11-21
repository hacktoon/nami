import Tile from './tile'
import { Grid } from '/lib/grid'
import { Name } from '/lib/name'
import { Random } from '/lib/base'

import { ReliefMap } from './geo/relief'
import { WaterMap } from './geo/water'
import { HeatMap } from './atm/heat'
import { MoistureMap } from './atm/moisture'
import { BiomeMap } from './bio/biome'


const DEFAULT_CONFIG = {size: 257, roughness: 8, seed: ''}


const buildConfig = (rawConfig={}) => {
    let config = Object.assign(DEFAULT_CONFIG, rawConfig)
    config.seed = config.seed.length ? config.seed : String(+new Date())
    Random.seed = config.seed
    return config
}


export default class World {
    constructor(config) {
        let {size, roughness, seed} = buildConfig(config)
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