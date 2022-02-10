import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { TileMap } from '/lib/model/tilemap'
import { UITileMap } from '/ui/tilemap'

import { Temperature } from './model'
import { TemperatureTileMapDiagram } from './diagram'


const SCHEMA = new Schema(
    'TemperatureTileMap',
    Type.rect('rect', 'Rect', {default: '150x100'}),
    Type.number('scale', 'Scale', {default: 4, step: 1, min: 1, max: 100}),
    Type.number('frequency', 'Frequency', {default: 4, step: 1, min: 1, max: 100}),
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

