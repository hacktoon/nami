import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { TileMap } from '/model/lib/tilemap'
import { UITileMap } from '/ui/tilemap'

import { Temperature } from './model'
import { TemperatureTileMapDiagram } from './diagram'


const SCHEMA = new Schema(
    'TemperatureTileMap',
    Type.number('width', 'Width', {default: 150, step: 1, min: 1, max: 500}),
    Type.number('height', 'Height', {default: 100, step: 1, min: 1, max: 500}),
    Type.number('scale', 'Scale', {default: 4, step: 1, min: 1, max: 100}),
    Type.number('radiation', 'Radiation', {default: 4, step: 1, min: -50, max: 50}),
    Type.text('seed', 'Seed', {default: ''})
)


export class TemperatureTileMap extends TileMap {
    static id = 'TemperatureTileMap'
    static diagram = TemperatureTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new TemperatureTileMap(params)
    }

    constructor(params) {
        super(params)
        this.model = new Temperature(this.seed, params)
    }

    getRegion(point) {
        return this.model.getRegion(point)
    }

    getTemperature(point) {
        return this.model.getTemperature(point)
    }

    get(point) {
        return {
            temperature: this.model.getTemperature(point)
        }
    }

    map(callback) {
        return this.model.map(plate => callback(plate))
    }

    forEach(callback) {
        this.model.forEach(callback)
    }
}

