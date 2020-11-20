import { Type } from '/lib/type'
import { MetaClass } from '/lib/meta'
import { Color } from '/lib/color'
import { Point } from '/lib/point'
import { Rect } from '/lib/number'


export class MapDiagram {
    static meta = new MetaClass(
        Type.point("Focus point", new Point(100, 74)),
        Type.boolean("Wrap grid", false),
        Type.boolean("Show border", true),
        Type.number("Tile size", 5, {step: 1, min: 1}),
        Type.color("Border color", Color.fromHex('#069')),
        Type.color("Background", Color.fromHex('#333')),
    )

    static create(map, data) {
        const config = MapDiagram.meta.parseConfig(data)
        return new MapDiagram(map, config)
    }

    constructor(map, config) {
        this.map = map
        this.width = map.width
        this.height = map.height
        this.wrapGrid = config.get('wrapGrid')
        this.tileSize = config.get('tileSize')
        this.background = config.get('background')
        this.showBorder = config.get('showBorder')
        this.borderColor = config.get('borderColor')
        this.focus = config.get('focusPoint')
        this.config = config.original()
    }

    get(point) {
        return this.getColor(this.map, point)
    }

    getColor(map, point) {
        if (! this.isWrappable(point)) {
            return 'transparent'
        }
        if (this.showBorder && map.isBorder(point)) {
            return this.borderColor.toHex()
        }
        return this.background.toHex()
    }

    isWrappable(point) {
        if (this.wrapGrid) return true
        return new Rect(this.width, this.height).inside(point)
    }
}