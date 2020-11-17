import { Grid } from '/lib/grid'
import { Point } from '/lib/point'
import { Type } from '/lib/type'
import { MetaClass } from '/lib/meta'
import { Color } from '/lib/color'


export class MapDiagram {
    static meta = new MetaClass(
        Type.boolean("Wrap grid", false),
        Type.point("Focus point", new Point(0, 0)),
        Type.number("Tile size", 6, {step: 1, min: 1}),
    )

    static create(map, data) {
        const config = MapDiagram.meta.parseConfig(data)
        return new MapDiagram(map, config)
    }

    constructor(map, config) {
        this.map = map
        this.config = config
        this.width = map.width
        this.height = map.height
        this.wrapGrid = config.wrapGrid
        this.tileSize = config.tileSize
        this.focus = config.focusPoint
    }

    get(point) {
        const height = this.map.get(point)
        return new Color(height, height, height).toHex()
    }
}