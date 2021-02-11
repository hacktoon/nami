import { Schema, Type } from '/lib/base/schema'
import { Color } from '/lib/base/color'
import { BaseMapDiagram } from '/model/lib/map'


export class MapDiagram extends BaseMapDiagram {
    static schema = new Schema(
        Type.boolean('showBorder', 'Show border', {default: false}),
        Type.color('continent', 'Continent', {default: Color.fromHex('#389E4A')}),
        Type.color('ocean', 'Ocean', {default: Color.fromHex('#058')}),
        Type.color('borderColor', 'Border', {default: Color.fromHex('#F90')})
    )

    static create(map, params) {
        return new MapDiagram(map, params)
    }

    constructor(map, params) {
        super(map)
        this.continent = params.get('continent')
        this.ocean = params.get('ocean')
        this.showBorder = params.get('showBorder')
        this.borderColor = params.get('borderColor')
    }

    get(point) {
        if (this.showBorder && this.map.isBorder(point)) {
            return this.borderColor.toHex()
        }
        const ocean = this.ocean.toHex()
        const continent = this.continent.toHex()
        if (this.map.isOceanicPlate(point)) return ocean
        return this.map.isContinent(point) ? continent : ocean
    }
}