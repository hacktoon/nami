import { Schema } from '/lib/base/schema'
import { Color } from '/lib/base/color'
import { TileMapDiagram } from '/model/lib/tilemap'


export class NoiseTileMapDiagram extends TileMapDiagram {
    static schema = new Schema('NoiseTileMapDiagram')

    static create(mapModel) {
        return new NoiseTileMapDiagram(mapModel)
    }

    get(point) {
        const value = parseInt(this.mapModel.get(point), 10)
        return new Color(value, value, value).toHex()
    }
}