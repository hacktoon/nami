import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Color } from '/lib/base/color'
import { BaseMapDiagram } from '/model/lib/map'


export class MapDiagram extends BaseMapDiagram {
    static schema = new Schema(
        Type.boolean('showBorder', 'Show border', {default: false}),
        Type.color('continent', 'Continent', {default: Color.fromHex('#389E4A')}),
        Type.color('ocean', 'Ocean', {default: Color.fromHex('#058')}),
        Type.color('borderColor', 'Border', {default: Color.fromHex('#F90')})
    )

    static create(mapModel, params) {
        return new MapDiagram(mapModel, params)
    }

    constructor(mapModel, params) {
        super(mapModel)
        this.continent = params.get('continent')
        this.ocean = params.get('ocean')
        this.showBorder = params.get('showBorder')
        this.borderColor = params.get('borderColor')
    }

    get(point) {
        if (this.showBorder && this.mapModel.isBorder(point)) {
            return this.borderColor.toHex()
        }
        const value = this.mapModel.get(point)
        const ocean = this.ocean.toHex()
        const continent = this.continent.toHex()
        if (value === 0) return ocean
        if (value === 1) return '#27A'
        if (value === 2) return continent
    }
}