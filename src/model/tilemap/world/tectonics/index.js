import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { TileMap } from '/model/lib/tilemap'
import { UITileMap } from '/ui/tilemap'

import { Tectonics } from './model'
import { TectonicsTileMapDiagram } from './diagram'


const SCHEMA = new Schema(
    'TectonicsTileMap',
    Type.number('width', 'Width', {default: 150, step: 1, min: 1}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1}),
    Type.number('scale', 'Scale', {default: 32, step: 1, min: 1}),
    Type.text('seed', 'Seed', {default: ''})
)


export class TectonicsTileMap extends TileMap {
    static id = 'TectonicsTileMap'
    static diagram = TectonicsTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new TectonicsTileMap(params)
    }

    constructor(params) {
        super(params)
        this.data = new Tectonics(this.seed, params)
    }

    getPlate(point) {
        return this.data.getPlate(point)
    }

    isPlateBorderAt(point) {
        return this.data.isPlateBorderAt(point)
    }

    map(callback) {
        return this.data.map(plate => callback(plate))
    }

    forEach(callback) {
        this.data.forEach(callback)
    }
}

