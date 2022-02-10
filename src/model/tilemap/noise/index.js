import { Matrix } from '/lib/matrix'
import { TileMap } from '/lib/model/tilemap'
import { SimplexNoise } from '/lib/fractal/noise'
import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { UITileMap } from '/ui/tilemap'

import { NoiseTileMapDiagram } from './diagram'


const SCHEMA = new Schema(
    'NoiseTileMap',
    Type.rect('rect', 'Rect', {default: '150x100'}),
    Type.number('detail', 'Detail', {default: 4, step: 1, min: 1, max: 20}),
    Type.number('resolution', 'Resolution', {default: .4, step: 0.1, min: 0.1, max: 1}),
    Type.number('scale', 'Scale', {default: .02, step: 0.01, min: 0.01, max: 1}),
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
        const keys = ['detail', 'resolution', 'scale']
        const [detail, resolution, scale] = params.get(...keys)
        const simplex = new SimplexNoise(detail, resolution, scale)
        let [min, max] = [Number.MAX_VALUE, Number.MIN_VALUE]
        this.matrix = Matrix.fromRect(this.rect, point => {
            const noiseValue = simplex.get(point)
            if (noiseValue > max) {
                max = noiseValue
            } else if (noiseValue < min) {
                min = noiseValue
            }
            return noiseValue
        })
        this.range = [min, max]
    }

    get(point) {
        return this.matrix.get(point)
    }
}
