import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Color } from '/src/lib/color'
import { clamp } from '/src/lib/number'
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
        this.params = params
        this.#noiseTileMap = this.#buildNoiseTileMap()
    }

    get(point) {
        const seaLevel = this.params.get('seaLevel')
        const noise = this.#noiseTileMap.getNoise(point)
        const octet = parseInt(noise * 255, 10)
        if (octet < seaLevel)
            return new Color(40, 120, 160)
        return new Color(150, 200, 70)
    }

    getDescription() {
        return [
            `Area: ${this.#noiseTileMap.area}`,
        ].join(', ')
    }
}
