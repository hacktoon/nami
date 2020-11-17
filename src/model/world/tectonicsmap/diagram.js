import { Type } from '/lib/type'
import { MetaClass } from '/lib/meta'
import { Color } from '/lib/color'
import { Point } from '/lib/point'


export class MapDiagram {
    static meta = new MetaClass(
        Type.point("Focus point", new Point(100, 74)),
        Type.boolean("Wrap grid", false),
        Type.boolean("Show border", true),
        Type.number("Tile size", 5, {step: 1, min: 1}),
        Type.color("Border color", Color.fromHex('#069')),
        Type.color("Background", Color.fromHex('#333')),
    )

    static create(tectonicsMap, data) {
        const config = MapDiagram.meta.parseConfig(data)
        return new MapDiagram(tectonicsMap, config)
    }

    constructor(map, config) {
        this.width = map.width
        this.height = map.height
        this.wrapGrid = config.wrapGrid
        this.tileSize = config.tileSize
        this.focus = config.focusPoint
        this.config = config
        this.map = map
    }

    get(point) {
        return this.getColor(this.map, point)
    }

    isWrappable(point) {
        if (this.wrapGrid) return true
        const col = point.x >= 0 && point.x < this.width
        const row = point.y >= 0 && point.y < this.height
        return col && row
    }

    getColor(map, point) {
        if (! this.isWrappable(point)) {
            return 'transparent'
        }

        if (this.config.showBorder && map.isBorder(point)) {
            return this.config.borderColor.toHex()
        }
        return this.config.background.toHex()
    }
}