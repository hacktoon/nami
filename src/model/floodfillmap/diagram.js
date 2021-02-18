import { Schema, Type } from '/lib/base/schema'
import { Color } from '/lib/base/color'
import { clamp } from '/lib/base/number'
import { BaseMapDiagram } from '/model/lib/map'


export class MapDiagram extends BaseMapDiagram {
    static schema = new Schema(
        Type.boolean('showBorders', 'Show borders', {default: true}),
    )

    static create(map, params) {
        return new MapDiagram(map, params)
    }

    constructor(map, params) {
        super(map)
        this.showBorders = params.get('showBorders')
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
        if (this.showBorders && this.map.isBorder(point)) {
            return this.colorMap[value].darken(40).toHex()
        }
        return this.colorMap[value].toHex()
    }
}