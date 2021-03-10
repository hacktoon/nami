import { BaseMap } from '/model/lib/map'
import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { MapUI } from '/lib/ui/map'
import { MapDiagram } from './diagram'
import { PlateMatrix } from './plate'


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
        this.matrix = new PlateMatrix(this.width, this.height, params)
        // 2: build deformations using borders
    }

    isBorder(point) {
        return this.regionMap.isBorder(point)
    }

    get(point) {
        return this.matrix.get(point)
    }
}
