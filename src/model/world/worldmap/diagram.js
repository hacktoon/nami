import { Schema } from '/lib/schema'
import { BaseMapDiagram } from '/model/lib/map'


export class MapDiagram extends BaseMapDiagram {
    static schema = new Schema()

    static create(map) {
        return new MapDiagram(map)
    }

    get(point) {
        return this.map.reliefMap.codeMap.getColor(point)
    }
}