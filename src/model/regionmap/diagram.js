import { Type } from '/lib/type'
import { MetaClass } from '/lib/meta'
import { Color } from '/lib/color'
import { Point } from '/lib/point'


// TODO: diagram should be a tile filter
// diagram is a render rules object
// define tiles as drawable or not, or filters like translate
// diagram here should be a list of tiles to render

export class Diagram {
    static meta = new MetaClass(
        Type.point("Focus point", new Point(100, 74)),
        Type.boolean("Wrap grid", false),
        Type.boolean("Show border", false),
        Type.boolean("Show origin", false),
        Type.number("Tile size", 5, {step: 1, min: 1}),
        Type.number("Layer", 3, {step: 1, min: 0}),
        Type.color("Foreground", Color.fromHex('#251')),
        Type.color("Background", Color.fromHex('#059')),
        Type.color("Border color", Color.fromHex('#04D')),
    )

    static create(regionMap, rawConfig) {
        const config = Diagram.meta.parseConfig(rawConfig)
        return new Diagram(regionMap, config)
    }

    constructor(regionMap, config) {
        this.width = regionMap.width
        this.height = regionMap.height
        this.regionMap = regionMap
        this.config = config
        this.wrapGrid = config.wrapGrid
        this.tileSize = config.tileSize
        this.focus = config.focusPoint
    }

    get(point) {
        return this.getColor(this.config, this.regionMap, point)
    }

    getColor(config, regionMap, point) {
        if (! this.isWrappable(point)) {
            return 'transparent'
        }
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
        const pointLayer = regionMap.getLayer(point)
        // invert this check to get remaining spaces
        if (! regionMap.isOverLayer(point, config.layer)) {
            return config.background.darken(pointLayer*5).toHex()
        } else {
            return config.foreground.darken(pointLayer*5).toHex()
        }
    }

    isWrappable(point) {
        if (this.wrapGrid) return true
        const col = point.x >= 0 && point.x < this.width
        const row = point.y >= 0 && point.y < this.height
        return col && row
    }
}