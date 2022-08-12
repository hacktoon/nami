import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Color } from '/src/lib/color'
import { TileMapDiagram } from '/src/lib/model/tilemap'


const SCHEMA = new Schema(
    'TerrainTileMapDiagram',
    Type.boolean('showMargins', 'Show margins', {default: true}),
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
        this.showMargins = params.get('showMargins')
        this.showLevel = params.get('showLevel')
    }

    get(point) {
        const color = this.colorMap.getOutline(point)
        if (this.showMargins) {
            if (this.tileMap.isLandMargin(point))
                return color.darken(40)
            if (this.tileMap.isSeaMargin(point))
                return color.brighten(20)
        }
        return color
    }
}
