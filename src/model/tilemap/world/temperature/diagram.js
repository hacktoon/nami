import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Color } from '/lib/base/color'

import { TileMapDiagram } from '/model/lib/tilemap'


export class TemperatureTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'TemperatureTileMapDiagram',
        // Type.boolean('showPlateBorders', 'Show borders', {default: true}),
    )

    static create(tileMap, params) {
        return new TemperatureTileMapDiagram(tileMap, params)
    }

    constructor(tileMap, params) {
        super(tileMap)
        this.colorMap = new TemperatureColorMap(tileMap)
    }

    get(point) {
        const region = this.tileMap.getRegion(point)
        const temp = this.tileMap.getTemperature(point)
        return this.colorMap.get(region).darken(temp * 20).toHex()
    }
}


class TemperatureColorMap {
    constructor(tileMap) {
        const entries = tileMap.map(region => [region.id, region.color])
        this.map = new Map(entries)
    }

    get(region) {
        return this.map.get(region.id)
    }
}
