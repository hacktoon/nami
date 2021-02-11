import { Schema, Type } from '/lib/base/schema'
import { Color } from '/lib/color'
import { clamp } from '/lib/number'
import { BaseMapDiagram } from '/model/lib/map'


export class MapDiagram extends BaseMapDiagram {
    static schema = new Schema(
    )

    static create(map, params) {
        return new MapDiagram(map, params)
    }

    constructor(map, params) {
        super(map)
        this.colorMap = this.buildColorMap()
    }

    buildColorMap() {
        const map = {}
        for(let i = 1; i <= this.map.regionCount; i++) {
            map[i] = new Color()
        }
        return map
    }

    get(point) {
        const value = this.map.get(point)
        return this.colorMap[value].toHex()
    }
}