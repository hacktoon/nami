import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { TileMap } from '/model/lib/tilemap'
import { UITileMap } from '/ui/tilemap'
import { TileableDiamondSquare } from '/lib/fractal/diamondsquare'

import { HeightTileMapDiagram } from './diagram'


const SCHEMA = new Schema(
    'HeightTileMap',
    Type.number('roughness', 'Roughness', {default: 8, min: 1, step: 1}),
    Type.selection('size', 'Size', {default: 257, options: [
        {id: 257}, {id: 129}, {id: 65}
    ]}),
    Type.text('seed', 'Seed', {default: ''})
)


export default class HeightTileMap extends TileMap {
    static id = 'HeightTileMap'
    static diagram = HeightTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new HeightTileMap(params)
    }

    constructor(params) {
        super(params)
        this.size = Number(params.get('size'))
        this.width = this.size
        this.height = this.size
        this.roughness = params.get('roughness')
        this.map = new TileableDiamondSquare(this.size, this.roughness)
    }

    get(point) {
        return this.map.get(point)
    }
}