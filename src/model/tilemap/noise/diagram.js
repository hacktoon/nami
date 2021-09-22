import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Color } from '/lib/base/color'
import { TileMapDiagram } from '/lib/model/tilemap'


class NoiseColorMap {
    constructor(tileMap) {
        this.tileMap = tileMap
    }

    get(point, maxColors) {
        const rawvalue = Number(this.tileMap.get(point))
        const value = this.normalize(rawvalue, maxColors)
        return new Color(value, value, value).toHex()
    }

    normalize(value, maxColors) {
        const [min, max] = this.tileMap.range
        const step = Math.floor(((value - min) * maxColors) / (max - min))
        return step * Math.floor(256 / maxColors)
    }
}


export class NoiseTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'NoiseTileMapDiagram',
        Type.number('maxColors', 'Max colors', {
            default: 200, step: 1, min: 1, max: 256
        }),
    )
    static colorMap = NoiseColorMap

    static create(tileMap, colorMap, params) {
        return new NoiseTileMapDiagram(tileMap, colorMap, params)
    }

    constructor(tileMap, colorMap, params) {
        super(tileMap)
        this.colorMap = colorMap
        this.maxColors = params.get('maxColors')
    }

    get(point) {
        return this.colorMap.get(point, this.maxColors)
    }
}
