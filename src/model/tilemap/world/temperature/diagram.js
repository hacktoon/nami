import { Schema } from '/src/lib/schema'
import { TileMapDiagram } from '/src/lib/model/tilemap'


const SCHEMA = new Schema(
    'TemperatureTileMapDiagram',
)


class TemperatureColorMap {
    constructor(tileMap) {
        this.tileMap = tileMap
    }

    get(point) {
        return this.tileMap.getColor(point)
    }
}


export class TemperatureTileMapDiagram extends TileMapDiagram {
    static schema = SCHEMA
    static colorMap = TemperatureColorMap

    static create(tileMap, colorMap, params) {
        return new TemperatureTileMapDiagram(tileMap, colorMap, params)
    }

    get(point) {
        return this.tileMap.getColor(point)
    }
}
