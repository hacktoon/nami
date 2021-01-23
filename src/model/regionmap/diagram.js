import { Schema, Type } from '/lib/schema'
import { Color } from '/lib/color'
import { BaseMapDiagram } from '/model/lib/map'


export class MapDiagram extends BaseMapDiagram {
    static schema = new Schema(
        Type.boolean('showBorders', 'Show borders', true),
        Type.boolean('showOrigins', 'Show origins', true),
        Type.boolean('showSeeds', 'Show seeds', false),
        Type.boolean('invertColors', 'Invert colors', false),
        Type.boolean('randomColors', 'Random colors', true),
        Type.number('showLayer', 'Show layer', 3, {step: 1, min: 0}),
        Type.number('selectRegion', 'Select region', -1, {step: 1, min: -1}),
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
        this.showSeeds = params.get('showSeeds')
        this.fgColor = params.get('fgColor')
        this.bgColor = params.get('bgColor')
        this.selectRegion = params.get('selectRegion')
        this.invertColors = params.get('invertColors')
        this.randomColors = params.get('randomColors')
    }

    get(point) {
        const cell = this.map.get(point)
        const fgcolor = this.randomColors ? cell.region.color : this.fgColor
        const isBorder = this.showBorders && cell.isBorder()
        const isOrigin = this.showOrigins && cell.isOrigin()
        const showSeeds = this.showSeeds && cell.isLayer(this.showLayer)

        if (isOrigin) return fgcolor.invert().toHex()
        if (showSeeds) return fgcolor.brighten(isBorder ? 0 : 40).toHex()
        if (isBorder) return fgcolor.darken(70).toHex()

        const background = this.invertColors ? this.bgColor : fgcolor
        const foreground = this.invertColors ? fgcolor : this.bgColor
        let baseColor = cell.layer > this.showLayer ? foreground : background
        if (cell.isRegionId(this.selectRegion))
            baseColor = baseColor.brighten(60)
        return baseColor.darken(cell.layer * 5).toHex()
    }
}