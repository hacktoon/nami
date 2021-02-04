import { Schema, Type } from '/lib/schema'
import { Color } from '/lib/color'
import { BaseMapDiagram } from '/model/lib/map'


export class MapDiagram extends BaseMapDiagram {
    static schema = new Schema(
        Type.color('fgColor', 'FG color', Color.fromHex('#111')),
        Type.color('bgColor', 'BG color', Color.fromHex('#DDD'))
    )

    static create(map, params) {
        return new MapDiagram(map, params)
    }

    constructor(map, params) {
        super(map)
        this.fgColor = params.get('fgColor')
        this.bgColor = params.get('bgColor')
    }

    get(point) {
        const value = this.map.get(point)
        const color = value === 0 ? this.bgColor : this.fgColor
        return color.toHex()
    }
}