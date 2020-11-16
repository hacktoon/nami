import { Type } from '/lib/type'
import { MetaClass } from '/lib/meta'
import { Grid } from '/lib/grid'

import RegionMap from '/model/regionmap'
import { Diagram } from './diagram'


export default class TectonicsMap {
    static meta = new MetaClass(
        Type.number("Width", 200, {step: 1, min: 1}),
        Type.number("Height", 150, {step: 1, min: 1}),
        Type.number("Plates", 8, {step: 1, min: 1}),
        Type.seed("Seed", '')
    )
    static Diagram = Diagram

    static create(data) {
        const config = TectonicsMap.meta.parseConfig(data)
        const regionMap = createRegionMap(config)
        const grid = new Grid(config.width, config.height, point => {
            // 1: build basic tectonics map
            return regionMap.get(point)
        })
        // // 2: build deformations using borders
        return new TectonicsMap(regionMap, grid, config)
    }

    constructor(regionMap, grid, config) {
        this.regionMap = regionMap
        this.grid = grid
        this.width = config.width
        this.height = config.height
        this.seed = config.seed
        this.config = config
    }

    get(point) {
        return this.grid.get(point)
    }
}


function createRegionMap(config) {
    console.log('travou');
    // TODO:  accept any params
    return RegionMap.create({
        count: config.count,
        layerGrowth: 40,
        growthChance: 0.1,

    })
}