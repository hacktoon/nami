import { Schema, Type } from '/lib/schema'
import { Color } from '/lib/color'
import { Rect } from '/lib/number'
import { Point } from '/lib/point'


// TODO: diagram should be a tile filter
// define tiles as drawable or not, or filters like translate()
// diagram here should be a list of tiles to render
// set tileRenderBatch
// use olde object to clear previous tiles
// but clear only points not in newBatch (use PointSet)

export class MapDiagram {
    static schema = new Schema(
        Type.boolean('wrapGrid', "Wrap grid", false),
        Type.boolean('showBorder', "Show border", true),
        Type.boolean('showOrigin', "Show origin", false),
        Type.number('layer', "Layer", 3, {step: 1, min: 0}),
        Type.color('foreground', "Foreground", Color.fromHex('#251')),
        Type.color('background', "Background", Color.fromHex('#059')),
        Type.color('borderColor', "Border color", Color.fromHex('#021')),
    )

    static create(map, params) {
        return new MapDiagram(map, params)
    }

    constructor(map, config) {
        this.map = map
        // TODO: set `this.data` and add attributes dynamically
        this.wrapGrid = config.get('wrapGrid')
        this.showBorder = config.get('showBorder')
        this.foreground = config.get('foreground')
        this.background = config.get('background')
        this.borderColor = config.get('borderColor')
        this.showOrigin = config.get('showOrigin')
        this.layer = config.get('layer')
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
        return new Rect(this.width, this.height).inside(point)
    }
}