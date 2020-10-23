import { Grid } from '/lib/grid'
import { MetaClass, Schema } from '/lib/meta'


export class Diagram {
    static meta = new MetaClass(
        Schema.boolean("Wrap grid", false),
        Schema.number("Tile size", 6, {step: 1, min: 1}),
    )

    static create(worldMap, data) {
        const config = Diagram.meta.parseConfig(data)
        return new Diagram(worldMap, config)
    }

    constructor(worldMap, config) {
        this.worldMap = worldMap
        this.width = worldMap.width
        this.height = worldMap.height
        this.wrapMode = config.wrapGrid
        this.tileSize = config.tileSize

        this.grid = new Grid(worldMap.width, worldMap.height, point => {
            return this.worldMap.reliefMap.codeMap.getColor(point)
        })
    }

    get(point) {
        return this.grid.get(point)
    }
}