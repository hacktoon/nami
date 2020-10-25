import { Grid } from '/lib/grid'
import { Type } from '/lib/type'
import { MetaClass } from '/lib/meta'
import { Color } from '/lib/color'


export class Diagram {
    static meta = new MetaClass(
        Type.number("Tile size", 6, {step: 1, min: 1}),
    )

    static create(map, data) {
        const config = Diagram.meta.parseConfig(data)
        return new Diagram(map, config)
    }

    constructor(map, config) {
        this.map = map
        this.config = config
        this.width = map.width
        this.height = map.height
        this.wrapMode = false
        this.tileSize = config.tileSize

        this.grid = new Grid(map.width, map.height, point => {
            const height = this.map.get(point)
            return new Color(height, height, height).toHex()
        })
    }

    get(point) {
        return this.grid.get(point)
    }
}