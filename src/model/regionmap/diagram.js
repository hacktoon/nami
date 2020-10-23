import { Grid } from '/lib/grid'
import { MetaClass, Schema } from '/lib/meta'


const meta = new MetaClass('RegionMapDiagram',
    Schema.boolean("Wrap grid", false),
    Schema.boolean("Show border", true),
    Schema.boolean("Show origin", false),
    Schema.number("Tile size", 80, {step: 1, min: 1}),
    Schema.number("Layer", 10, {step: 1, min: 0}),
    Schema.color("Foreground", '#251'),
    Schema.color("Background", '#059'),
    Schema.color("Border color", '#04D'),
)


// TODO: diagram should be a tile filter
// diagram is a render rules object
// define tiles as drawable or not, or filters like translate
// diagram here should be a list of tiles to render

export class Diagram {
    static meta = meta

    static create(regionMap, rawConfig) {
        const config = meta.parse(rawConfig)
        return new Diagram(regionMap, config)
    }

    constructor(regionMap, config) {
        this.regionMap = regionMap
        this.config = config
        this.width = regionMap.width
        this.height = regionMap.height
        this.wrapMode = config.wrapGrid
        this.tileSize = config.tileSize
    }

    get(point) {
        if (this.isWrappable(point))
            return this.getColor(this.config, this.regionMap, point)
        return 'transparent'
    }

    getColor(config, regionMap, point) {
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
    }

    isWrappable(point) {
        if (this.wrapMode) return true
        const col = point.x >= 0 && point.x < this.width
        const row = point.y >= 0 && point.y < this.height
        return col && row
    }
}