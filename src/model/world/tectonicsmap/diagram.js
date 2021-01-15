import { Schema, Type } from '/lib/schema'
import { Color } from '/lib/color'
import { BaseMapDiagram } from '/model/lib/map'


export class MapDiagram extends BaseMapDiagram {
    static schema = new Schema(
        Type.boolean('showBorder', 'Show border', true),
        Type.color('continent', 'Continent', Color.fromHex('#389E4A')),
        Type.color('borderColor', 'Border color', Color.fromHex('#111')),
    )

    static create(map, params) {
        return new MapDiagram(map, params)
    }

    constructor(map, params) {
        super(map)
        this.continent = params.get('continent')
        this.showBorder = params.get('showBorder')
        this.borderColor = params.get('borderColor')
    }

    get(point) {
        return this.getColor(point)
    }

    getColor(point) {
        if (this.showBorder && this.map.isBorder(point)) {
            return this.borderColor.toHex()
        }
        if (this.map.isOceanicPlate(point)) return '#069'
        return this.map.isContinent(point) ? this.continent.toHex() : '#069'
    }
}