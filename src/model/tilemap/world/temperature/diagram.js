import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { Color } from '/lib/base/color'

import { TileMapDiagram } from '/lib/model/tilemap'


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
        const temp = this.tileMap.getTemperature(point)
        const color = this.colorMap.get(temp.zone)
        return color.darken(temp.temp * 2).toHex()
    }
}


class TemperatureColorMap {
    constructor() {
        this.map = new Map([
            [0, Color.fromHex('#ff4444')], // tropical
            [1, Color.fromHex('#ffc600')], // subtropical
            [2, Color.fromHex('#99d966')], // temperate
            [3, Color.fromHex('#c4fdff')], // polar
        ])
    }

    get(zone) {
        return this.map.get(zone)
    }
}
