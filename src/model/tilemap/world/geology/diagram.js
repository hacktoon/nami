import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { TileMapDiagram } from '/src/model/lib/tilemap'


const SCHEMA = new Schema(
    'GeologyTileMapDiagram',
    Type.boolean('showLandBorder', 'Land border', {default: false}),
    Type.boolean('showWaterBorder', 'Water border', {default: false}),
    Type.boolean('showTerrain', 'Terrain', {default: false}),
)


class ColorMap {
    constructor(tileMap) {
        this.tileMap = tileMap
    }

    getByBasin(point) {
        const basin = this.tileMap.getBasin(point)
        return this.basinColors.get(basin)
    }

    isWater(point) {
        return this.tileMap.isWater(point)
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
        this.params = params
    }

    get(point) {
        const surface = this.tileMap.getSurface(point)
        const terrain = this.tileMap.getTerrain(point)
        const showLandBorder = this.params.get('showLandBorder')
        const showWaterBorder = this.params.get('showWaterBorder')
        const showTerrain = this.params.get('showTerrain')
        let color = surface.color
        if (showTerrain && terrain) {
            color = terrain.color
        }
        if (showLandBorder && this.tileMap.isLandBorder(point)) {
            color = color.darken(40)
        }
        if (showWaterBorder && this.tileMap.isWaterBorder(point)) {
            color = color.brighten(40)
        }
        return color
    }

    getText(point) {
        if (this.params.get('showErosion')) {
            const direction = this.tileMap.getErosionDirection(point)
            if (direction) {
                return direction.symbol
            }
        }
        return ''
    }
}
