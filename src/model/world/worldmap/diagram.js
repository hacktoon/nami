import { Grid } from '/lib/grid'
import { Point } from '/lib/point'
import { Type } from '/lib/type'
import { MetaClass } from '/lib/meta'


export class MapDiagram {
    static meta = new MetaClass(
        Type.point("Focus point", new Point(0, 0)),
        Type.boolean("Wrap grid", false),
        Type.number("Tile size", 6, {step: 1, min: 1}),
    )

    static create(worldMap, data) {
        const config = MapDiagram.meta.parseConfig(data)
        return new MapDiagram(worldMap, config)
    }

    constructor(worldMap, config) {
        this.worldMap = worldMap
        this.config = config
        this.width = worldMap.width
        this.height = worldMap.height
        this.wrapGrid = config.wrapGrid
        this.tileSize = config.tileSize
        this.focus = config.focusPoint
    }

    get(point) {
        if (! this.isWrappable(point)) {
            return 'transparent'
        }
        return this.worldMap.reliefMap.codeMap.getColor(point)
    }

    isWrappable(point) {
        if (this.wrapGrid) return true
        const col = point.x >= 0 && point.x < this.width
        const row = point.y >= 0 && point.y < this.height
        return col && row
    }
}