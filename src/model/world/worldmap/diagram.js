import { Point } from '/lib/point'
import { Rect } from '/lib/number'
import { Type } from '/lib/type'
import { MetaClass } from '/lib/meta'


export class MapDiagram {
    static meta = new MetaClass(
        Type.point("Focus point", new Point(0, 0)),
        Type.boolean("Wrap grid", false),
        Type.number("Tile size", 6, {step: 1, min: 1}),
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
        return this.map.reliefMap.codeMap.getColor(point)
    }

    isWrappable(point) {
        if (this.wrapGrid) return true
        return new Rect(this.width, this.height).inside(point)
    }
}