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
        if (type == 0) return new Color(40, 120, 160) // water
        if (type == 1) return new Color(150, 200, 70) // land
        return new Color(100, 160, 100) // shore
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
