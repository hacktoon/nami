import { Schema } from '/lib/base/schema'
import { Color } from '/lib/base/color'
import { BaseMapDiagram } from '/model/lib/map'


export class MapDiagram extends BaseMapDiagram {
    static schema = new Schema('NoiseMapDiagram')

    static create(mapModel) {
        return new MapDiagram(mapModel)
    }

    get(point) {
        const value = parseInt(this.mapModel.get(point), 10)
        return new Color(value, value, value).toHex()
    }
}