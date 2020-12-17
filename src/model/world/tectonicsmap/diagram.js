import { Schema, Type } from '/lib/schema'
import { Color } from '/lib/color'


export class MapDiagram {
    static schema = new Schema(
        Type.color('background', 'Background', Color.fromHex('#333')),
        Type.boolean('showBorder', 'Show border', true),
        Type.color('borderColor', 'Border color', Color.fromHex('#069')),
    )

    static create(map, params) {
        return new MapDiagram(map, params)
    }

    constructor(map, params) {
        this.map = map
        this.background = params.get('background')
        this.showBorder = params.get('showBorder')
        this.borderColor = params.get('borderColor')
    }

    get width() {
        return this.map.width
    }

    get height() {
        return this.map.height
    }

    get(point) {
        return this.getColor(this.map, point)
    }

    getColor(map, point) {
        if (this.showBorder && map.isBorder(point)) {
            return this.borderColor.toHex()
        }
        return this.background.toHex()
    }
}