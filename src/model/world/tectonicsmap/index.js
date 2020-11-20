import { Type } from '/lib/type'
import { MetaClass } from '/lib/meta'
import { Grid } from '/lib/grid'

import RegionMap from '/model/regionmap'
import { MapDiagram } from './diagram'


export default class TectonicsMap {
    static meta = new MetaClass(
        Type.number("Width", 200, {step: 1, min: 1}),
        Type.number("Height", 150, {step: 1, min: 1}),
        Type.number("Plates", 10, {step: 1, min: 1}),
        Type.seed("Seed", '')
    )
    static MapDiagram = MapDiagram

    static create(data) {
        const config = TectonicsMap.meta.parseConfig(data)
        const width = config.get('width')
        const height = config.get('height')
        const regionMap = RegionMap.create({
            width,
            height,
            count: config.get('plates'),
            layerGrowth: 40,
            growthChance: 0.1,
        })
        const grid = new Grid(
            width,
            height,
            point => {
                // 1: build basic tectonics map
                return regionMap.get(point)
            })
        // 2: build deformations using borders
        return new TectonicsMap(regionMap, grid, config)
    }

    constructor(regionMap, grid, config) {
        this.grid = grid
        this.regionMap = regionMap
        this.width = config.get('width')
        this.height = config.get('height')
        this.seed = config.get('seed')
        this.config = config.original()
    }

    isBorder(point) {
        return this.regionMap.isBorder(point)
    }

    get(point) {
        return this.grid.get(point)
    }
}
