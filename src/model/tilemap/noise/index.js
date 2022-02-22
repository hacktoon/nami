import { Matrix } from '/src/lib/matrix'
import { TileMap } from '/src/lib/model/tilemap'
import { SimplexNoise } from '/src/lib/noise'
import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { UITileMap } from '/src/ui/tilemap'

import { NoiseTileMapDiagram } from './diagram'


const SCHEMA = new Schema(
    'NoiseTileMap',
    Type.rect('rect', 'Size', {default: '150x100'}),
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

    static fromData(data) {
        const map = new Map(Object.entries(data))
        const params = NoiseTileMap.schema.buildFrom(map)
        return new NoiseTileMap(params)
    }

    #matrix

    constructor(params) {
        super(params)
        const keys = ['detail', 'resolution', 'scale']
        const [detail, resolution, scale] = params.get(...keys)
        // const simplex = new SimplexNoise(detail, resolution, scale)
        const simplex = new SimplexNoise(detail, resolution, scale)
        let [min, max] = [Number.MAX_VALUE, Number.MIN_VALUE]
        this.#matrix = Matrix.fromRect(this.rect, point => {
            const s = point[0] / this.rect.width
            const t = point[1] / this.rect.height
            const x1 = 2
            const y1 = 2
            const dx = 100 - x1
            const dy = 100 - y1
            const nx = x1 + Math.cos(s * 2 * Math.PI) * dx / (2 * Math.PI)
            const ny = y1 + Math.cos(t * 2 * Math.PI) * dy / (2 * Math.PI)
            const nz = x1 + Math.sin(s * 2 * Math.PI) * dx / (2 * Math.PI)
            const nw = y1 + Math.sin(t * 2 * Math.PI) * dy / (2 * Math.PI)
            const noiseValue = simplex.noise4D(nx, ny, nz, nw)
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
        return this.#matrix.get(point)
    }
}
