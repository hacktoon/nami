import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Color } from '/src/lib/color'
import { TileMapDiagram } from '/src/lib/model/tilemap'


const SCHEMA = new Schema(
    'TerrainTileMapDiagram',
    Type.boolean('showOutline', 'Show outline', {default: true}),
)


class ColorMap {
    constructor(tileMap) {
        this.tileMap = tileMap
    }

    getOutline(point) {
        const outline = this.tileMap.getOutline(point)
        return outline.color
    }

    getType(point) {
        const type = this.tileMap.getType(point)
        return type.color
    }
}


export class TerrainTileMapDiagram extends TileMapDiagram {
    static schema = SCHEMA
    static colorMap = ColorMap

    static create(tileMap, colorMap, params) {
        return new TerrainTileMapDiagram(tileMap, colorMap, params)
    }

    constructor(tileMap, colorMap, params) {
        super(tileMap)
        this.colorMap = colorMap
        this.showOutline = params.get('showOutline')
    }

    get(point) {
        if (this.showOutline)
            return this.colorMap.getOutline(point)
        return this.colorMap.getType(point)
    }
}
