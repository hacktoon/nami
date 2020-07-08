import { Grid } from '/lib/grid'
import { Meta, Schema } from '/lib/meta'


const META = new Meta('RegionMapImage',
    Schema.boolean("Wrap grid", false),
    Schema.boolean("Show border", true),
    Schema.boolean("Show origin", false),
    Schema.number("Tile size", 6, {step: 1, min: 1}),
    Schema.number("Layer", 10, {step: 1, min: 0}),
    Schema.color("Foreground", '#251'),
    Schema.color("Background", '#059'),
    Schema.color("Border color", '#04D'),
)


export class Image {
    static meta = META

    static create(regionMap, data) {
        const config = META.parse(data)
        return new Image(regionMap, config)
    }

    constructor(regionMap, config) {
        this.regionMap = regionMap
        this.width = regionMap.width
        this.height = regionMap.height
        this.wrapMode = config.wrapGrid
        this.tilesize = config.tileSize

        this.grid = new Grid(regionMap.width, regionMap.height, point => {
            if (config.showBorder && regionMap.isBorder(point)) {
                return config.borderColor.toHex()
            }
            if (config.showOrigin && regionMap.isOrigin(point)) {
                return config.foreground.invert().toHex()
            }
            // draw seed
            if (regionMap.isLayer(point, config.layer)) {
                return config.foreground.brighten(40).toHex()
            }
            // invert this check to get remaining spaces
            const pointLayer = regionMap.getLayer(point)
            if (regionMap.isOverLayer(point, config.layer)) {
                return config.background.darken(pointLayer*5).toHex()
            } else {
                return config.foreground.darken(pointLayer*5).toHex()
            }
        })
    }

    get(point) {
        return this.grid.get(point)
    }
}