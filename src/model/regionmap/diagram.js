import { Type } from '/lib/type'
import { MetaClass } from '/lib/meta'
import { Color } from '/lib/color'
import { Point } from '/lib/point'


// TODO: diagram should be a tile filter
// diagram is a render rules object
// define tiles as drawable or not, or filters like translate
// diagram here should be a list of tiles to render

export class MapDiagram {
    static meta = new MetaClass(
        Type.point("Focus point", new Point(100, 74)),
        Type.boolean("Wrap grid", false),
        Type.boolean("Show border", true),
        Type.boolean("Show origin", false),
        Type.number("Tile size", 5, {step: 1, min: 1}),
        Type.number("Layer", 3, {step: 1, min: 0}),
        Type.color("Foreground", Color.fromHex('#251')),
        Type.color("Background", Color.fromHex('#059')),
        Type.color("Border color", Color.fromHex('#021')),
    )

    static create(regionMap, rawConfig) {
        const config = MapDiagram.meta.parseConfig(rawConfig)
        return new MapDiagram(regionMap, config)
    }

    constructor(map, config) {
        this.map = map
        this.wrapGrid = config.get('wrapGrid')
        this.showBorder = config.get('showBorder')
        this.foreground = config.get('foreground')
        this.background = config.get('background')
        this.borderColor = config.get('borderColor')
        this.showOrigin = config.get('showOrigin')
        this.tileSize = config.get('tileSize')
        this.layer = config.get('layer')
        this.focus = config.get('focusPoint')
        this.config = config.original()
    }

    get width() {
        return this.map.width
    }

    get height() {
        return this.map.height
    }

    get(point) {
        return this.getColor(point)
    }

    getColor(point) {
        if (! this.isWrappable(point)) {
            return 'transparent'
        }
        if (this.showBorder && this.map.isBorder(point)) {
            return this.borderColor.toHex()
        }
        if (this.showOrigin && this.map.isOrigin(point)) {
            return this.foreground.invert().toHex()
        }
        // draw seed
        if (this.map.isLayer(point, this.layer)) {
            return this.foreground.brighten(40).toHex()
        }
        const pointLayer = this.map.getLayer(point)
        // invert this check to get remaining spaces
        if (! this.map.isOverLayer(point, this.layer)) {
            return this.background.darken(pointLayer*5).toHex()
        } else {
            return this.foreground.darken(pointLayer*5).toHex()
        }
    }

    isWrappable(point) {
        if (this.wrapGrid) return true
        const col = point.x >= 0 && point.x < this.width
        const row = point.y >= 0 && point.y < this.height
        return col && row
    }
}