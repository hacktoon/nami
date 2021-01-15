import { BaseMap } from '/model/lib/map'
import { Grid } from '/lib/grid'
import { Point } from '/lib/point'
import { Schema, Type } from '/lib/schema'
import { SimplexNoise } from '/lib/noise'

import RegionMap from '/model/regionmap'
import { MapDiagram } from './diagram'


export default class TectonicsMap extends BaseMap {
    static schema = new Schema(
        Type.number('width', 'Width', 200, {step: 1, min: 1}),
        Type.number('height', 'Height', 150, {step: 1, min: 1}),
        Type.number('plates', 'Plates', 10, {step: 1, min: 1}),
        Type.text('seed', 'Seed', '')
    )
    static diagram = MapDiagram

    static create(params) {
        return new TectonicsMap(params)
    }

    constructor(params) {
        super(params)
        this.regionMap = this.#buildRegionMap(params)
        const simplex = new SimplexNoise(8, 0.7, 0.01)
        this.grid = new Grid(
            this.width,
            this.height,
            point => {
                // 1: build basic tectonics map
                const region = this.regionMap.get(point)
                const x = region.id * 3
                const y = region.id * 10
                const noisePt = point.plus(new Point(x, y))
                const isContinent = simplex.noise(noisePt) > 127
                return {region, isContinent}
            }
        )
        // 2: build deformations using borders
    }

    #buildRegionMap(params) {
        return RegionMap.fromData({
            width: this.width,
            height: this.height,
            count: params.get('plates'),
            layerGrowth: 40,
            growthChance: 0.1,
            seed: params.get('seed')
        })
    }

    isBorder(point) {
        return this.regionMap.isBorder(point)
    }

    isContinent(point) {
        return this.grid.get(point).isContinent
    }


}
