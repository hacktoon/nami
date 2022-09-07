import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { TileMapDiagram } from '/src/lib/model/tilemap'


const SCHEMA = new Schema(
    'GeologyTileMapDiagram'
)


class ColorMap {
    constructor(tileMap) {
        this.tileMap = tileMap
    }

    getTerrain(point) {
        const outline = this.tileMap.getTerrain(point)
        return outline.color
    }
}


export class GeologyTileMapDiagram extends TileMapDiagram {
    static schema = SCHEMA
    static colorMap = ColorMap

    static create(tileMap, colorMap, params) {
        return new GeologyTileMapDiagram(tileMap, colorMap, params)
    }

    constructor(tileMap, colorMap, params) {
        super(tileMap)
        this.colorMap = colorMap
        this.showBorders = params.get('showBorders')
        this.showLevel = params.get('showLevel')
    }

    get(point) {
        return this.colorMap.getTerrain(point)
    }
}
