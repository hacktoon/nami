import { GenericMap } from '/model/lib/map'
import { Grid } from '/lib/grid'
import { Schema, Type } from '/lib/schema'

import RegionMap from '/model/regionmap'
import { MapDiagram } from './diagram'


export default class TectonicsMap extends GenericMap {
    static id = 'TectonicsMap'

    static schema = new Schema(
        Type.number('width', 'Width', 200, {step: 1, min: 1}),
        Type.number('height', 'Height', 150, {step: 1, min: 1}),
        Type.number('plates', 'Plates', 10, {step: 1, min: 1}),
        Type.text('seed', 'Seed', '')
    )
    static MapDiagram = MapDiagram

    static create(params) {
        return new TectonicsMap(params)
    }

    constructor(params) {
        super(params)
        this.regionMap = RegionMap.fromData({
            width: this.width,
            height: this.height,
            count: params.get('plates'),
            layerGrowth: 40,
            growthChance: 0.1,
            seed: params.get('seed')
        })
        this.grid = new Grid(
            this.width,
            this.height,
            point => {
                // 1: build basic tectonics map
                return this.regionMap.get(point)
            }
        )
        // 2: build deformations using borders
    }

    isBorder(point) {
        return this.regionMap.isBorder(point)
    }

    get(point) {
        return this.regionMap.get(point)
    }
}
