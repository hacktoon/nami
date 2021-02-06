import { Schema, Type } from '/lib/schema'
import { Color } from '/lib/color'
import { BaseMapDiagram } from '/model/lib/map'


export class MapDiagram extends BaseMapDiagram {
    static schema = new Schema(
        Type.boolean('randomColors', 'Random colors', false)
    )

    static create(map, params) {
        return new MapDiagram(map, params)
    }

    constructor(map, params) {
        super(map)
        this.randomColors = params.get('randomColors')
        this.colorMap = this.buildColorMap()
    }

    buildColorMap() {
        const map = {}
        const color = new Color()
        for(let i=1; i<=this.map.count; i++) {
            map[i] = this.randomColors ? new Color() : color.brighten(i * 10)
        }
        return map
    }

    get(point) {
        const value = this.map.get(point)
        const color = value === 0 ? this.bgColor : this.colorMap[value]
        return color.toHex()
    }
}