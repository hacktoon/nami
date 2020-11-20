import Tile from './tile'
import { Grid } from '/lib/grid'
import { Name } from '/lib/name'
import { Type } from '/lib/type'
import { MetaClass } from '/lib/meta'

import { ReliefMap } from './geo/relief'
import { MapDiagram } from './diagram'


export default class WorldMap {
    static meta = new MetaClass(
        Type.number("Roughness", 8),
        Type.number("Size", 257, {min: 1, step: 1}),
        Type.seed("Seed", '')
    )

    static MapDiagram = MapDiagram

    static create(data) {
        const config = WorldMap.meta.parseConfig(data)
        const size = config.get('size')
        const roughness = config.get('roughness')
        const reliefMap = new ReliefMap(size, roughness)
        const grid = new Grid(size, size, point => new Tile(point))
        return new WorldMap(reliefMap, grid, config)
    }

    constructor(reliefMap, grid, config) {
        this.grid = grid
        this.name = Name.createLandmassName()
        this.config = config.original()
        this.seed = config.get('seed')
        this.size = config.get('size')
        this.width = config.get('size')
        this.height = config.get('size')
        this.area = config.get('size') * config.get('size')
        this.reliefMap = reliefMap
    }

    get(point) {
        return this.grid.get(point)
    }
}