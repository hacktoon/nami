import Tile from './tile'
import { Grid } from '/lib/grid'
import { Name } from '/lib/name'
import { Random } from '/lib/random'
import { MetaClass, Schema } from '/lib/meta'

import { ReliefMap } from './geo/relief'
import { Diagram } from './image'


const META = new MetaClass('WorldMap',
    Schema.number("Roughness", 8),
    Schema.number("Size", 257, {min: 1, step: 1}),
    Schema.seed("Seed", '')
)


export default class WorldMap {
    static meta = META
    static Diagram = Diagram

    static create(data) {
        const config = META.parse(data)
        Random.seed = config.seed
        const reliefMap = new ReliefMap(config.size, config.roughness)
        const grid = new Grid(config.size, config.size, point => new Tile(point))
        return new WorldMap(reliefMap, grid, config)
    }

    constructor(reliefMap, grid, config) {
        this.name = Name.createLandmassName()
        this.seed = config.seed
        this.size = config.size
        this.width = config.size
        this.height = config.size
        this.area = config.size * config.size
        this.grid = grid
        this.reliefMap = reliefMap
    }

    get(point) {
        return this.grid.get(point)
    }
}