import { Grid } from '/lib/grid'
import { Meta, Schema } from '/lib/meta'
import { Color } from '/lib/color'


const META = new Meta('NoiseMapImage',
    Schema.boolean("Wrap grid", false),
    Schema.number("Tile size", 6, {step: 1, min: 1}),
    Schema.color("Border color", '#04D'),
)


export class Image {
    static meta = META

    static create(map, data) {
        const config = META.parse(data)
        return new Image(map, config)
    }

    constructor(map, config) {
        this.map = map
        this.width = map.width
        this.height = map.height
        this.wrapMode = config.wrapGrid
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