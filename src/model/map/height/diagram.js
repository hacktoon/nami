import { Schema } from '/lib/base/schema'
import { Color } from '/lib/base/color'
import { BaseMapDiagram } from '/model/lib/map'


export class MapDiagram extends BaseMapDiagram {
    static schema = new Schema('BaseDiagram')

    static create(mapModel) {
        return new MapDiagram(mapModel)
    }

    get(point) {
        const height = this.mapModel.map.get(point)
        const color = new Color(height, height, height)
        return color.toHex()
    }
}