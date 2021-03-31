import { Schema } from '/lib/base/schema'
import { Color } from '/lib/base/color'
import { TileMapDiagram } from '/model/lib/tilemap'


export class NoiseTileMapDiagram extends TileMapDiagram {
    static schema = new Schema('NoiseTileMapDiagram')

    static create(tilemap) {
        return new NoiseTileMapDiagram(tilemap)
    }

    get(point) {
        const value = parseInt(this.tilemap.get(point), 10)
        return new Color(value, value, value).toHex()
    }
}