import { Grid } from '/lib/grid'
import { Meta, Schema } from '/lib/meta'


const META = new Meta('WorldMapImage',
    Schema.boolean("Wrap grid", false),
    Schema.number("Tile size", 6, {step: 1, min: 1}),
)


export class Image {
    static meta = META

    static create(worldMap, data) {
        const config = META.parse(data)
        return new Image(worldMap, config)
    }

    constructor(worldMap, config) {
        this.worldMap = worldMap
        this.width = worldMap.width
        this.height = worldMap.height
        this.wrapMode = config.wrapGrid
        this.tilesize = config.tileSize

        this.grid = new Grid(worldMap.width, worldMap.height, point => {
            return this.worldMap.reliefMap.codeMap.getColor(point)
        })
    }

    get(point) {
        return this.grid.get(point)
    }
}