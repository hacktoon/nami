import { Matrix } from '/lib/base/matrix'
import { TileMap } from '/model/lib/tilemap'
import { SimplexNoise } from '/lib/fractal/noise'
import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { UITileMap } from '/ui/tilemap'

import { NoiseTileMapDiagram } from './diagram'


const SCHEMA = new Schema(
    'NoiseTileMap',
    Type.number('width', 'Width', {default: 150, step: 1, min: 1}),
    Type.number('height', 'Height', {default: 150, step: 1, min: 1}),
    Type.number('detail', 'Detail', {default: 8, step: 1, min: 1, max: 20}),
    Type.number('resolution', 'Resolution', {default: .5, step: 0.1, min: 0.1}),
    Type.number('scale', 'Scale', {default: .01, step: 0.01, min: 0.01}),
    Type.text('seed', 'Seed', {default: ''})
)


export class NoiseTileMap extends TileMap {
    static diagram = NoiseTileMapDiagram
    static id = 'NoiseTileMap'
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new NoiseTileMap(params)
    }

    constructor(params) {
        super(params)
        this.detail = params.get('detail')
        this.resolution = params.get('resolution')
        this.scale = params.get('scale')

        const simplex = new SimplexNoise(
            this.detail,
            this.resolution,
            this.scale
        )
        this.matrix = new Matrix(this.width, this.height, point => {
            return simplex.at(point)
        })
    }

    get(point) {
        return this.matrix.get(point)
    }
}
