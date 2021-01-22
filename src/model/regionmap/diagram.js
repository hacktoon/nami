import { Schema, Type } from '/lib/schema'
import { Color } from '/lib/color'
import { BaseMapDiagram } from '/model/lib/map'


export class MapDiagram extends BaseMapDiagram {
    static schema = new Schema(
        Type.boolean('showBorder', 'Show border', true),
        Type.boolean('showOrigin', 'Show origin', true),
        Type.boolean('invert', 'Invert colors', false),
        Type.number('layer', 'Layer', 3, {step: 1, min: 0}),
        Type.number('showRegion', 'Show region', -1, {step: 1, min: -1}),
        Type.color('foreground', 'Foreground', Color.fromHex('#251')),
        Type.color('background', 'Background', Color.fromHex('#059')),
        Type.color('borderColor', 'Border color', Color.fromHex('#021')),
    )

    static create(map, params) {
        return new MapDiagram(map, params)
    }

    constructor(map, params) {
        super(map)
        // TODO: set `this.data` and add attributes dynamically
        this.showBorder = params.get('showBorder')
        this.showOrigin = params.get('showOrigin')
        this.layer = params.get('layer')
        this.foreground = params.get('foreground')
        this.background = params.get('background')
        this.borderColor = params.get('borderColor')
        this.showRegion = params.get('showRegion')
        this.invert = params.get('invert')
    }

    get(point) {
        if (this.showBorder && this.map.isBorder(point)) {
            if (this.map.regionAt(point).id === this.showRegion)
                return this.borderColor.invert().toHex()
            return this.borderColor.toHex()
        }
        if (this.showOrigin && this.map.isOrigin(point)) {
            return this.foreground.invert().toHex()
        }
        // draw seed
        if (this.map.isLayer(point, this.layer)) {
            return this.foreground.brighten(40).toHex()
        }

        const pointLayer = this.map.at(point).layer
        const background = this.invert ? this.background : this.foreground
        const foreground = this.invert ? this.foreground : this.background
        if (this.map.isOverLayer(point, this.layer)) {
            return foreground.darken(pointLayer*5).toHex()
        } else {
            return background.darken(pointLayer*5).toHex()
        }
    }
}