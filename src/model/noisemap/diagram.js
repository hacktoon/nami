import { Point } from '/lib/point'
import { Type } from '/lib/type'
import { MetaClass } from '/lib/meta'
import { Color } from '/lib/color'
import { Rect } from '/lib/number'


export class MapDiagram {
    static meta = new MetaClass(
        Type.boolean("Wrap grid", false),
        Type.point("Focus point", new Point(0, 0)),
        Type.number("Tile size", 10, {step: 1, min: 1}),
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
        this.focus = config.get('focusPoint')
        this.config = config.original()
    }

    get(point) {
        if (! this.isWrappable(point)) {
            return 'transparent'
        }
        const value = this.map.get(point)
        return new Color(value, value, value).toHex()
    }

    isWrappable(point) {
        if (this.wrapGrid) return true
        return new Rect(this.width, this.height).inside(point)
    }
}