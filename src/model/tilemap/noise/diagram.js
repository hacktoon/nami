import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Color } from '/lib/base/color'
import { TileMapDiagram } from '/model/lib/tilemap'


export class NoiseTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'NoiseTileMapDiagram',
        Type.number('maxColors', 'Max colors', {default: 200, step: 1, min: 1, max: 256}),
    )

    static create(tilemap, params) {
        return new NoiseTileMapDiagram(tilemap, params)
    }

    constructor(tilemap, params) {
        super(tilemap)
        this.maxColors = params.get('maxColors')
    }

    get(point) {
        const rawvalue = Number(this.tilemap.get(point))
        const value = this.normalize(rawvalue)
        return new Color(value, value, value).toHex()
    }

    normalize(value) {
        const [min, max] = this.tilemap.range
        const step = Math.floor(((value - min) * this.maxColors) / (max - min))
        const color = Math.floor(256 / this.maxColors)
        return step * color
    }
}
