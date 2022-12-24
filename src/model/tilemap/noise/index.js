import { Matrix } from '/src/lib/matrix'
import { SimplexNoise } from '/src/lib/noise'
import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/point'
import { TileMap } from '/src/model/lib/tilemap'
import { UITileMap } from '/src/ui/tilemap'

import { NoiseTileMapDiagram } from './diagram'


const SCHEMA = new Schema(
    'NoiseTileMap',
    Type.rect('rect', 'Size', {default: '100x100'}),
    Type.number('octaves', 'Octaves', {default: 5, step: 1, min: 1, max: 20}),
    Type.number('resolution', 'Resolution', {default: .6, step: 0.1, min: 0.1, max: 1}),
    Type.number('scale', 'Scale', {default: .03, step: 0.01, min: 0.01, max: 1}),
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

    static fromData(data) {
        const map = new Map(Object.entries(data))
        const params = NoiseTileMap.schema.buildFrom(map)
        return new NoiseTileMap(params)
    }

    #matrix

    constructor(params) {
        super(params)
        const keys = ['octaves', 'resolution', 'scale']
        const [octaves, resolution, scale] = params.get(...keys)
        const simplex = new SimplexNoise(octaves, resolution, scale)
        let [min, max] = [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]
        this.#matrix = Matrix.fromRect(this.rect, point => {
            const value = simplex.wrappedNoise4D(this.rect, point)
            if (value > max) {
                max = value
            } else if (value < min) {
                min = value
            }
            return value
        })
        this.range = [min, max]
    }

    get(point) {
        return [
            `point: ${Point.hash(point)}`,
            `value: ${this.getNoise(point)}`
        ].join(', ')
    }

    getNoise(point) {
        const value = this.#matrix.get(point)
        const [min, max] = this.range
        // normalize to [0, 1]
        return (value - min) / (max - min)
    }
}
