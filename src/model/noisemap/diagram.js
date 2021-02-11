import { Schema } from '/lib/base/schema'
import { Color } from '/lib/base/color'
import { BaseMapDiagram } from '/model/lib/map'


export class MapDiagram extends BaseMapDiagram {
    static schema = new Schema()

    static create(map) {
        return new MapDiagram(map)
    }

    get(point) {
        const value = parseInt(this.map.get(point), 10)
        return new Color(value, value, value).toHex()
    }
}