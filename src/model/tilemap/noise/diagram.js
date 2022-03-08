import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Color } from '/src/lib/color'
import { clamp } from '/src/lib/number'
import { TileMapDiagram } from '/src/lib/model/tilemap'


class NoiseColorMap {
    constructor(tileMap) {
        this.tileMap = tileMap
    }

    get(point, range, colors) {
        const [min, max] = range
        const noise = this.tileMap.getNoise(point)
        const octet = parseInt(noise * 255, 10)
        if (octet < min) return Color.BLACK
        if (octet > max) return Color.WHITE
        const step = Math.floor(255 / colors)
        const index = Math.floor(octet / step)
        const color = clamp(index * step, 0, 255)
        return new Color(color, color, color)
    }
}


export class NoiseTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'NoiseTileMapDiagram',
        Type.number('minLevel', 'Min level', {
            default: 1, step: 5, min: 0, max: 255
        }),
        Type.number('maxLevel', 'Max level', {
            default: 1, step: 5, min: 0, max: 255
        }),
        Type.number('colors', 'Colors', {
            default: 200, step: 1, min: 1, max: 255
        }),
    )
    static colorMap = NoiseColorMap

    static create(tileMap, colorMap, params) {
        return new NoiseTileMapDiagram(tileMap, colorMap, params)
    }

    constructor(tileMap, colorMap, params) {
        super(tileMap)
        this.colorMap = colorMap
        this.minLevel = params.get('minLevel')
        this.maxLevel = params.get('maxLevel')
        this.colors = params.get('colors')
    }

    get(point) {
        const range = [this.minLevel, this.maxLevel]
        return this.colorMap.get(point, range, this.colors)
    }
}
