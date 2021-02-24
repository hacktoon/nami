import { BaseMap } from '/model/lib/map'
import { Matrix } from '/lib/base/matrix'
import { Point } from '/lib/base/point'
import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { SimplexNoise } from '/lib/noise'
import { MapUI } from '/lib/ui/map'

import RegionMap from '/model/regionmap'
import { MapDiagram } from './diagram'


const SCHEMA = new Schema(
    Type.number('width', 'Width', {default: 150, step: 1, min: 1}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1}),
    Type.number('scale', 'Scale', {default: 25, step: 1, min: 1}),
    Type.text('seed', 'Seed', {default: ''})
)


export default class TectonicsMap extends BaseMap {
    static label = 'Tectonics map'
    static diagram = MapDiagram
    static schema = SCHEMA
    static ui = MapUI

    static create(params) {
        return new TectonicsMap(params)
    }

    constructor(params) {
        super(params)
        this.floodFillMap = this.#buildFloodFillMap(params)
        const simplex = new SimplexNoise(6, 0.7, 0.01)

        this.matrix = new Matrix(
            this.width,
            this.height,
            point => {
                const region = this.floodFillMap.get(point)
                const x = region * 1000
                const y = region * 1000
                const noisePt = point.plus(new Point(x, y))
                const isContinent = simplex.at(noisePt) > 127
                const isOceanicPlate = region <= 2
                return {region, isContinent, isOceanicPlate}
            }
        )
        // 2: build deformations using borders
    }

    #buildFloodFillMap(params) {
        return RegionMap.fromData({
            width: this.width,
            height: this.height,
            scale: params.get('scale'),
            growth: 2,
            chance: 0.3,
            seed: params.get('seed')
        })
    }

    isBorder(point) {
        return this.floodFillMap.isBorder(point)
    }

    isContinent(point) {
        return this.get(point).isContinent
    }

    isOceanicPlate(point) {
        return this.get(point).isOceanicPlate
    }

    get(point) {
        return this.matrix.get(point)
    }
}
