import { Schema, Type } from '/lib/schema'
import { Color } from '/lib/color'
import { BaseMapDiagram } from '/model/lib/map'


export class MapDiagram extends BaseMapDiagram {
    static schema = new Schema(
        Type.boolean('showBorders', 'Show borders', true),
        Type.boolean('showOrigins', 'Show origins', true),
        Type.boolean('invertColors', 'Invert colors', false),
        Type.boolean('randomColors', 'Random colors', false),
        Type.number('showLayer', 'Show layer', 3, {step: 1, min: 0}),
        Type.number('showRegion', 'Show region', -1, {step: 1, min: -1}),
        Type.color('fgColor', 'FG color', Color.fromHex('#251')),
        Type.color('bgColor', 'BG color', Color.fromHex('#059'))
    )

    static create(map, params) {
        return new MapDiagram(map, params)
    }

    constructor(map, params) {
        super(map)
        // TODO: set `this.attrs` and add attributes dynamically
        this.showBorders = params.get('showBorders')
        this.showOrigins = params.get('showOrigins')
        this.showLayer = params.get('showLayer')
        this.fgColor = params.get('fgColor')
        this.bgColor = params.get('bgColor')
        this.showRegion = params.get('showRegion')
        this.invertColors = params.get('invertColors')
        this.randomColors = params.get('randomColors')
    }

    get(point) {
        const cell = this.map.at(point)
        const region = this.map.regionAt(point)
        const fgcolor = this.randomColors ? region.color : this.fgColor
        const isBorder = this.showBorders && cell.isBorder()
        const isOrigin = this.showOrigins && cell.isOrigin()
        const showSeeds = cell.isLayer(this.showLayer)

        if (isOrigin) {
            return fgcolor.invert().toHex()
        }
        if (showSeeds) {
            return fgcolor.brighten(isBorder ? 0 : 40).toHex()
        }
        if (isBorder) {
            const color = fgcolor.darken(70)
            if (this.map.regionAt(point).id === this.showRegion)
                return color.invert().toHex()
            return color.toHex()
        }

        const background = this.invertColors ? this.bgColor : fgcolor
        const foreground = this.invertColors ? fgcolor : this.bgColor
        const color = cell.layer > this.showLayer ? foreground : background
        return color.darken(cell.layer * 5).toHex()
    }
}