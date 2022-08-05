import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'
import { TileMapDiagram } from '/src/lib/model/tilemap'


const SCHEMA = new Schema(
    'SurfaceTileMapDiagram',
)


class SurfaceColorMap {
    constructor(tileMap) {
        this.tileMap = tileMap
    }

    get(point) {
        const type = this.tileMap.get(point)
        const water = new Color(40, 120, 160)
        const land = new Color(150, 200, 70)
        return type == 0 ? water : land
    }
}


export class SurfaceTileMapDiagram extends TileMapDiagram {
    static schema = SCHEMA
    static colorMap = SurfaceColorMap

    static create(tileMap, colorMap, params) {
        return new SurfaceTileMapDiagram(tileMap, colorMap, params)
    }

    constructor(tileMap, colorMap, params) {
        super(tileMap)
        this.colorMap = colorMap
    }

    get(point) {
        return this.colorMap.get(point)
    }
}
