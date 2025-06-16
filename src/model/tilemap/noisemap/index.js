import { SimplexNoise } from '/src/lib/geometry/noise'
import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/geometry/point'
import { TileMap } from '/src/model/tilemap/lib'
import { UITileMap } from '/src/ui/tilemap'

import { NoiseTileMapDiagram } from './diagram'


const SCHEMA = new Schema(
    'NoiseTileMap',
    Type.number('size', 'Size', {default: 100, min: 64, max: 200}),
    Type.number('octaves', 'Octaves', {default: 5, step: 1, min: 1, max: 20}),
    Type.number('resolution', 'Resolution', {default: .6, step: 0.1, min: 0.1, max: 1}),
    Type.number('scale', 'Scale', {default: .03, step: 0.01, min: 0.01, max: 1}),
    Type.text('seed', 'Seed', {default: ''})
)


export class NoiseTileMap extends TileMap {
    static diagram = NoiseTileMapDiagram
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

    #simplex

    constructor(params) {
        super(params)
        this.params = params
        this.#simplex = new SimplexNoise()
    }

    get(point) {
        return [
            `point: ${Point.hash(point)}`,
            `value: ${this.getNoise(point)}`
        ].join(', ')
    }

    getNoise(point) {
        const keys = ['octaves', 'resolution', 'scale']
        const [octaves, resolution, scale] = this.params.get(...keys)
        const args = {octaves, resolution, scale}
        return this.#simplex.wrapped4D(this.rect, point, args)
    }
}
