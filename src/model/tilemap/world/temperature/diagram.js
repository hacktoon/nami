import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'
import { TileMapDiagram } from '/src/lib/model/tilemap'


const SCHEMA = new Schema(
    'TemperatureTileMapDiagram',
)


class TemperatureColorMap {
    constructor(tileMap) {
        this.tileMap = tileMap
        this.map = new Map([
            [0, Color.fromHex('#ff4444')], // tropical
            [1, Color.fromHex('#ffc600')], // subtropical
            [2, Color.fromHex('#99d966')], // temperate
            [3, Color.fromHex('#c4fdff')], // polar
        ])
    }

    get(point) {
        const index = this.tileMap.get(point)
        return this.map.get(index)
    }
}


export class TemperatureTileMapDiagram extends TileMapDiagram {
    static schema = SCHEMA
    static colorMap = TemperatureColorMap

    static create(tileMap, colorMap, params) {
        return new TemperatureTileMapDiagram(tileMap, colorMap, params)
    }

    constructor(tileMap, colorMap) {
        super(tileMap)
        this.colorMap = colorMap
    }

    get(point) {
        return this.colorMap.get(point)
    }
}
