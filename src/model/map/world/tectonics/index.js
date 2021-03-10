import { BaseMap } from '/model/lib/map'
import { Matrix } from '/lib/base/matrix'
import { Point } from '/lib/base/point'
import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { SimplexNoise } from '/lib/noise'
import { MapUI } from '/lib/ui/map'

import RegionMap from '/model/map/region'
import { MapDiagram } from './diagram'


const SCHEMA = new Schema(
    Type.number('width', 'Width', {default: 150, step: 1, min: 1}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1}),
    Type.number('scale', 'Scale', {default: 30, step: 1, min: 1}),
    Type.text('seed', 'Seed', {default: ''})
)


export default class TectonicsMap extends BaseMap {
    static id = 'Tectonics map'
    static diagram = MapDiagram
    static schema = SCHEMA
    static ui = MapUI

    static create(params) {
        return new TectonicsMap(params)
    }

    constructor(params) {
        super(params)
        const simplex = new SimplexNoise(6, 0.8, 0.01)
        this.regionMap = this.#buildRegionMap(params)
        this.matrix = new PlateMatrix(
            this.width, this.height, this.regionMap, simplex)
        // 2: build deformations using borders
    }

    #buildRegionMap(params) {
        return RegionMap.fromData({
            width: this.width,
            height: this.height,
            scale: params.get('scale'),
            growth: 20,
            chance: 0.3,
            seed: params.get('seed')
        })
    }

    isBorder(point) {
        return this.regionMap.isBorder(point)
    }

    get(point) {
        return this.matrix.get(point)
    }
}


class PlateMatrix {
    constructor(width, height, regionMap, simplex) {
        this.matrix = new Matrix(
            width,
            height,
            point => {
                const region = regionMap.getRegion(point)
                const x = region.id * 1000
                const y = region.id * 1000
                const noisePt = point.plus(new Point(x, y))
                const value = simplex.at(noisePt)
                if (region.id <= 3 || value < 110) return 0
                if (value < 160) return 1
                return 2
            }
        )
    }

    get (point) {
        return this.matrix.get(point)
    }
}