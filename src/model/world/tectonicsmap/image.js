import { Grid } from '/lib/grid'
import { Type } from '/lib/type'
import { MetaClass } from '/lib/meta'


export class Diagram {
    static meta = new MetaClass(
        Type.boolean("Wrap grid", false),
        Type.boolean("Show border", true),
        Type.number("Tile size", 6, {step: 1, min: 1}),
    )

    static create(tectonicsMap, data) {
        const config = Diagram.meta.parseConfig(data)
        return new Diagram(tectonicsMap, config)
    }

    constructor(tectonicsMap, config) {
        const {width, height} = tectonicsMap
        this.tectonicsMap = tectonicsMap
        this.width = width
        this.height = height
        this.wrapMode = config.wrapGrid
        this.tileSize = config.tileSize

        this.grid = new Grid(width, height, point => {

        })
    }

    get(point) {
        return this.grid.get(point)
    }
}