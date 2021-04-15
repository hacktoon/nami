import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Color } from '/lib/base/color'
import { TileMapDiagram } from '/model/lib/tilemap'


export class NoiseTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'NoiseTileMapDiagram',
        Type.number('totalColors', 'Total colors', {default: 4, step: 1, min: 1, max: 256}),
    )

    static create(tilemap, params) {
        return new NoiseTileMapDiagram(tilemap, params)
    }

    constructor(tilemap, params) {
        super(tilemap)
        this.totalColors = params.get('totalColors')
        console.log(tilemap.range);
    }

    get(point) {
        const value = parseInt(this.tilemap.get(point), 10)
        return new Color(value, value, value).toHex()
    }
}