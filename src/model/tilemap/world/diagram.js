import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Color } from '/src/lib/color'
import { TileMapDiagram } from '/src/model/lib/tilemap'


const SCHEMA = new Schema(
    'GeologyTileMapDiagram',
    Type.boolean('showRelief', 'Relief', {default: false}),
    Type.boolean('showLandBorder', 'Land border', {default: false}),
    Type.boolean('showWaterBorder', 'Water border', {default: false}),
    Type.boolean('showTemperature', 'Temperature', {default: false}),
    Type.boolean('showRain', 'Rain', {default: false}),
    Type.boolean('showErosion', 'Erosion', {default: false}),
)


class ColorMap {
    constructor(tileMap) {
        this.tileMap = tileMap
        this.erosionColors = new Map()
        for (let i = 0; i < tileMap.erosion.basinCount; i ++) {
            this.erosionColors.set(i, new Color())
        }
    }

    getByErosion(point) {
        const erosion = this.tileMap.erosion.get(point)
        return this.erosionColors.get(erosion.basin)
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
        const showLandBorder = this.params.get('showLandBorder')
        const showWaterBorder = this.params.get('showWaterBorder')
        const showRelief = this.params.get('showRelief')
        const showTemperature = this.params.get('showTemperature')
        const showRain = this.params.get('showRain')
        const point = this.rect.wrap(relativePoint)
        const surface = this.tileMap.surface.get(point)
        const isBorder = this.tileMap.relief.isBorder(point)
        let color = surface.color

        if (showRelief) {
            const relief = this.tileMap.relief.get(point)
            color = relief.color
        }
        if (showTemperature && ! surface.water) {
            const temperature = this.tileMap.temperature.get(point)
            color = temperature.color
        }
        if (showRain && ! surface.water) {
            const rain = this.tileMap.rain.get(point)
            color = rain.color
        }
        if (showLandBorder && isBorder && !surface.water) {
            color = color.darken(40)
        }
        if (showWaterBorder && isBorder && surface.water) {
            color = color.brighten(40)
        }
        if (this.params.get('showErosion')) {
            const erosion = this.tileMap.erosion.get(point)
            if (this.tileMap.erosion.debug(point)) {
                return Color.RED
            }
            if (surface.water) {
                return color.darken(100)
            } else {
                return erosion
                    ? this.colorMap.getByErosion(point)
                    : color.darken(100)
            }
        }
        return color
    }

    getText(point) {
        const erosion = this.tileMap.erosion.get(point)
        const hasText = erosion && this.params.get('showErosion')
        return hasText && erosion.flow ? erosion.flow.symbol : ''
    }
}
