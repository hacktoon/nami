import { Grid } from '/lib/grid'
import { MetaClass, Schema } from '/lib/meta'
import { Color } from '/lib/color'


const META = new MetaClass('NoiseMapDiagram',
    Schema.number("Tile size", 6, {step: 1, min: 1}),
)


export class Diagram {
    static meta = META

    static create(map, data) {
        const config = META.parse(data)
        return new Diagram(map, config)
    }

    constructor(map, config) {
        this.map = map
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