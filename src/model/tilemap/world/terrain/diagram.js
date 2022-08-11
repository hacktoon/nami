import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Color } from '/src/lib/color'
import { TileMapDiagram } from '/src/lib/model/tilemap'


const SCHEMA = new Schema(
    'TerrainTileMapDiagram',
    Type.boolean('showShore', 'Show shore', {default: true}),
)


class ColorMap {
    constructor(tileMap) {
        this.tileMap = tileMap
    }

    getOutline(point) {
        const outline = this.tileMap.getOutline(point)
        return outline.color
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
        this.showShore = params.get('showShore')
        this.showLevel = params.get('showLevel')
    }

    get(point) {
        const color = this.colorMap.getOutline(point)
        if (this.showShore && this.tileMap.isShore(point)) {
            return color.darken(40)
        }
        return color
    }
}
