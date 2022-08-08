import { Schema } from '/src/lib/schema'
import { TileMapDiagram } from '/src/lib/model/tilemap'


const SCHEMA = new Schema(
    'ClimateTileMapDiagram',
)


class TemperatureColorMap {
    constructor(tileMap) {
        this.tileMap = tileMap
    }

    get(point) {
        return this.tileMap.getColor(point)
    }
}


export class ClimateTileMapDiagram extends TileMapDiagram {
    static schema = SCHEMA
    static colorMap = TemperatureColorMap

    static create(tileMap, colorMap, params) {
        return new ClimateTileMapDiagram(tileMap, colorMap, params)
    }

    constructor(tileMap, colorMap) {
        super(tileMap)
        this.colorMap = colorMap
    }

    get(point) {
        return this.colorMap.get(point)
    }
}
