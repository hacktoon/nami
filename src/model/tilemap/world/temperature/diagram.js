import { Schema } from '/lib/schema'
import { Type } from '/lib/type'
import { Color } from '/lib/color'

import { TileMapDiagram } from '/lib/model/tilemap'


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


export class TemperatureTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'TemperatureTileMapDiagram',
        // Type.boolean('showPlateBorders', 'Show borders', {default: true}),
    )
    static colorMap = TemperatureColorMap

    static create(tileMap, colorMap, params) {
        return new GeologyTileMapDiagram(tileMap, colorMap, params)
    }

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
