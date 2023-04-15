import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Color } from '/src/lib/color'
import { clamp } from '/src/lib/number'
import { TileMapDiagram } from '/src/model/tilemap/lib'


export class NoiseTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'NoiseTileMapDiagram',
        Type.number('minLevel', 'Min level', {
            default: 0, step: 5, min: 0, max: 254
        }),
        Type.number('maxLevel', 'Max level', {
            default: 255, step: 5, min: 0, max: 255
        }),
        Type.number('colors', 'Colors', {
            default: 10, step: 1, min: 1, max: 255
        }),
    )

    static create(tileMap, params) {
        return new NoiseTileMapDiagram(tileMap, params)
    }

    constructor(tileMap, params) {
        super(tileMap)
        this.minLevel = params.get('minLevel')
        this.maxLevel = params.get('maxLevel')
        this.colors = params.get('colors')
    }

    get(point) {
        const noise = this.tileMap.getNoise(point)
        const octet = parseInt(noise * 255, 10)
        if (octet < this.minLevel) return Color.BLACK
        if (octet > this.maxLevel) return Color.WHITE
        const step = Math.floor(255 / this.colors)
        const index = clamp(Math.floor(octet / step), 0, this.colors - 1)
        const color = clamp(index * step, 0, octet)
        return new Color(color, color, color)
    }
}
