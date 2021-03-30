import { Schema } from '/lib/base/schema'
import { Color } from '/lib/base/color'
import { TileMapDiagram } from '/model/lib/tilemap'


export class HeightTileMapDiagram extends TileMapDiagram {
    static schema = new Schema('HeightTileMapDiagram')

    static create(mapModel) {
        return new HeightTileMapDiagram(mapModel)
    }

    get(point) {
        const height = this.mapModel.map.get(point)
        const color = new Color(height, height, height)
        return color.toHex()
    }
}