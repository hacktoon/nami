import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Color } from '/src/lib/color'
import { Matrix } from '/src/lib/matrix'
import { TileMap } from '/src/lib/model/tilemap'
import { UITileMap } from '/src/ui/tilemap'

import { NoiseTileMap } from '/src/model/tilemap/noise'
import { SurfaceTileMapDiagram } from './diagram'


const ID = 'SurfaceTileMap'
const SCHEMA = new Schema(
    ID,
    Type.rect('rect', 'Size', {default: '150x100'}),
    Type.number('seaLevel', 'Sea Level', {default: 150, min:1, max: 255}),
    Type.text('seed', 'Seed', {default: ''}),
)


export class SurfaceTileMap extends TileMap {
    static id = ID
    static diagram = SurfaceTileMapDiagram
    static schema = SCHEMA
    static ui = UITileMap

    static create(params) {
        return new SurfaceTileMap(params)
    }

    #noiseTileMap
    #surfaceMap

    #buildNoiseTileMap() {
        return NoiseTileMap.fromData({
            rect: this.rect.hash(),
            octaves: 6,
            resolution: .8,
            scale: .02,
            seed: this.seed,
        })
    }

    constructor(params) {
        super(params)
        this.#noiseTileMap = this.#buildNoiseTileMap()
        this.#surfaceMap = Matrix.fromRect(this.rect, point => {
            const seaLevel = params.get('seaLevel')
            const noise = this.#noiseTileMap.getNoise(point)
            const octet = parseInt(noise * 255, 10)
            return octet < seaLevel ? 0 : 1
        })
    }

    get(point) {
        return this.#surfaceMap.get(point)
    }

    getDescription() {
        return [
            `Area: ${this.#noiseTileMap.area}`,
        ].join(', ')
    }
}
