import { Schema, Type } from '/lib/schema'
import { Color } from '/lib/color'
import { BaseMapDiagram } from '/model/lib/map'


export class MapDiagram extends BaseMapDiagram {
    static schema = new Schema(
        Type.boolean('randomColors', 'Random colors', true)
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
        const color = new Color(0, 0, 0)
        for(let i = 1; i <= this.map.fillMap.size; i++) {
            const bright = Math.round(i * (this.map.scale / 2))
            map[i] = this.randomColors ? new Color() : color.brighten(bright)
        }
        return map
    }

    get(point) {
        const value = this.map.get(point)
        return this.colorMap[value].toHex()
    }
}