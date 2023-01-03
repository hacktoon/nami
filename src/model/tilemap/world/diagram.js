import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Color } from '/src/lib/color'
import { TileMapDiagram } from '/src/model/lib/tilemap'


const SCHEMA = new Schema(
    'GeologyTileMapDiagram',
    Type.boolean('showRelief', 'Relief', {default: false}),
    Type.boolean('showLandBorder', 'Land border', {default: false}),
    Type.boolean('showWaterBorder', 'Water border', {default: false}),
    Type.boolean('showBasins', 'Basins', {default: false}),
    Type.boolean('showFlow', 'Flow', {default: false}),
)


class ColorMap {
    constructor(tileMap) {
        this.tileMap = tileMap
        this.basinColors = new Map()
        for (let i = 0; i < tileMap.relief.basinCount; i ++) {
            this.basinColors.set(i, new Color())
        }
    }

    getByBasin(point) {
        const basin = this.tileMap.relief.getBasin(point)
        return this.basinColors.get(basin)
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

    get(relativePoint) {
        const point = this.rect.wrap(relativePoint)
        const surface = this.tileMap.surface.get(point)
        const relief = this.tileMap.relief.get(point)
        const showLandBorder = this.params.get('showLandBorder')
        const showWaterBorder = this.params.get('showWaterBorder')
        const showRelief = this.params.get('showRelief')
        let color = surface.color

        if (showRelief) {
            color = relief.color
        }
        if (showLandBorder && this.tileMap.relief.isLandBorder(point)) {
            color = color.darken(40)
        }
        const isWaterBorder = this.tileMap.relief.isWaterBorder(point)
        if (showWaterBorder && isWaterBorder) {
            color = color.brighten(40)
        }
        if (! surface.water && this.params.get('showBasins')) {
            return this.colorMap.getByBasin(point)
        }
        return color
    }

    getText(point) {
        if (this.params.get('showFlow')) {
            const direction = this.tileMap.erosion.getFlow(point)
            if (direction) {
                return direction.symbol
            }
        }
        return ''
    }
}
