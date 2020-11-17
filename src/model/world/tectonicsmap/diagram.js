import { Type } from '/lib/type'
import { MetaClass } from '/lib/meta'
import { Color } from '/lib/color'
import { Point } from '/lib/point'


export class Diagram {
    static meta = new MetaClass(
        Type.point("Focus point", new Point(0, 0)),
        Type.boolean("Wrap grid", false),
        Type.boolean("Show border", true),
        Type.number("Tile size", 6, {step: 1, min: 1}),
        Type.color("Border color", Color.fromHex('#04D')),
        Type.color("Background", Color.fromHex('#888')),
    )

    static create(tectonicsMap, data) {
        const config = Diagram.meta.parseConfig(data)
        return new Diagram(tectonicsMap, config)
    }

    constructor(tectonicsMap, config) {
        this.width = tectonicsMap.width
        this.height = tectonicsMap.height
        this.tectonicsMap = tectonicsMap
        this.config = config
        this.wrapGrid = config.wrapGrid
        this.tileSize = config.tileSize
        this.focus = config.focusPoint
    }

    get(point) {
        return this.getColor(this.tectonicsMap, point)
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