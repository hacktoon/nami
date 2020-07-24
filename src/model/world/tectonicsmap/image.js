import { Grid } from '/lib/grid'
import { Meta, Schema } from '/lib/meta'


const META = new Meta('RegionMapDiagram',
    Schema.boolean("Wrap grid", false),
    Schema.boolean("Show border", true),
    Schema.number("Tile size", 6, {step: 1, min: 1}),
)


export class Diagram {
    static meta = META

    static create(tectonicsMap, data) {
        const config = META.parse(data)
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