import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { TileMap } from '/model/lib/tilemap'
import { UITileMap } from '/ui/tilemap'

import { DeformModel } from './model'
import { ErosionTileMapDiagram } from './diagram'


const SCHEMA = new Schema(
    'ErosionTileMap',
    Type.number('width', 'Width', {default: 150, step: 1, min: 1, max: 500}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1, max: 500}),
    Type.text('seed', 'Seed', {default: ''})
)


export class ErosionTileMap extends TileMap {
    static id = 'ErosionTileMap'
    static diagram = ErosionTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new ErosionTileMap(params)
    }

    constructor(params) {
        super(params)
        this.geologyMap = this.model.geologyTileMap
    }

    get(point) {
       return ''
    }

    map(callback) {
        return this.model.map(plate => callback(plate))
    }

    forEach(callback) {
        this.model.forEach(callback)
    }
}
