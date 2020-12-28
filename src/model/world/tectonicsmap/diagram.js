import { Schema, Type } from '/lib/schema'
import { Color } from '/lib/color'
import { BaseMapDiagram } from '/model/lib/map'


export class MapDiagram extends BaseMapDiagram {
    static schema = new Schema(
        Type.color('background', 'Background', Color.fromHex('#333')),
        Type.boolean('showBorder', 'Show border', true),
        Type.color('borderColor', 'Border color', Color.fromHex('#069')),
    )

    static create(map, params) {
        return new MapDiagram(map, params)
    }

    constructor(map, params) {
        super(map)
        this.background = params.get('background')
        this.showBorder = params.get('showBorder')
        this.borderColor = params.get('borderColor')
    }

    get(point) {
        return this.getColor(point)
    }

    getColor(point) {
        if (this.showBorder && this.map.isBorder(point)) {
            return this.borderColor.toHex()
        }
        return this.background.toHex()
    }
}