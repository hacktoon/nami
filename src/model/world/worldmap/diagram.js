import { Schema } from '/lib/base/schema'
import { BaseMapDiagram } from '/model/lib/map'


export class MapDiagram extends BaseMapDiagram {
    static schema = new Schema()

    static create(mapModel) {
        return new MapDiagram(mapModel)
    }

    get(point) {
        return this.mapModel.reliefMap.codeMap.getColor(point)
    }
}