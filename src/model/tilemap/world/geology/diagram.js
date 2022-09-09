import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { TileMapDiagram } from '/src/lib/model/tilemap'


const SCHEMA = new Schema(
    'GeologyTileMapDiagram',
    Type.boolean('showBorders', 'Show borders', {default: false}),
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
        const color = this.colorMap.getTerrain(point)
        if (this.showBorders && this.tileMap.isBorder(point))
            return color.darken(20)
        return color
    }
}
