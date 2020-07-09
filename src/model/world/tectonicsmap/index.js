import { Meta, Schema } from '/lib/meta'
import { Grid } from '/lib/grid'

import { RegionMap } from '/model/regionmap'

import { Image } from './image'


const META = new Meta('TectonicsMap',
    Schema.number("Width", 200),
    Schema.number("Height", 150),
    Schema.number("Plates", 8),
    Schema.seed("Seed", '')
)


export default class TectonicsMap {
    static meta = META
    static Image = Image

    static create(data) {
        const config = META.parse(data)
        const regionMap = createRegionMap(config)
        const borders = []
        const grid = new Grid(config.width, config.height, point => {
            // 1: build basic tectonics map
            return regionMap.get(point)
        })
        // 2: build deformations using borders
        return new TectonicsMap(regionMap, grid, config)
    }

    constructor(regionMap, grid, config) {
        this.regionMap = regionMap
        this.grid = grid
        this.width = config.width
        this.height = config.height
        this.seed = config.seed
    }

    get(point) {
        return this.grid.get(point)
    }

}


function createRegionMap({plates, ...data}) {
    return RegionMap.create({
        count: plates,
        layerGrowth: 40,
        growthChance: 0.1,
        ...data
    })
}