import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'

import { TileMapDiagram } from '/src/model/tilemap/lib'
import { listenerCount } from 'process'


const SCHEMA = new Schema(
    'GeologyTileMapDiagram',
    Type.boolean('showRelief', 'Relief', {default: false}),
    Type.boolean('showLandBorder', 'Land border', {default: false}),
    Type.boolean('showWaterBorder', 'Water border', {default: false}),
    Type.boolean('showTemperature', 'Temperature', {default: false}),
    Type.boolean('showRain', 'Rain', {default: false}),
    Type.boolean('showErosion', 'Erosion', {default: false}),
    Type.boolean('showBasins', 'Basins', {default: false}),
    Type.boolean('showRivers', 'Rivers', {default: false}),
    Type.boolean('showRiverSources', 'River sources', {default: false}),
)


class ColorMap {
    constructor(tileMap) {
        this.tileMap = tileMap
        this.erosionColors = new Map()
        for (let i = 0; i < tileMap.river.basinCount; i ++) {
            this.erosionColors.set(i, new Color())
        }
    }

    getByBasin(point) {
        const river = this.tileMap.river.get(point)
        return this.erosionColors.get(river.basin)
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
        this.riverColor = Color.BLUE
    }

    get(relativePoint) {
        const point = this.rect.wrap(relativePoint)
        const showLandBorder = this.params.get('showLandBorder')
        const showWaterBorder = this.params.get('showWaterBorder')
        const showRelief = this.params.get('showRelief')
        const showTemperature = this.params.get('showTemperature')
        const showRain = this.params.get('showRain')
        const surface = this.tileMap.surface.get(point)
        const relief = this.tileMap.relief.get(point)
        const isBorder = this.tileMap.relief.isBorder(point)
        let color = surface.color

        if (showRelief) {
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
        if (this.params.get('showBasins')) {
            const river = this.tileMap.river.get(point)
            if (river && !surface.water) {
                const erosionColor = this.colorMap.getByBasin(point)
                color = erosionColor.brighten(relief.id * 10)
            }
        }
        return color
    }

    getText(relativePoint) {
        const point = this.rect.wrap(relativePoint)
        const showErosion = this.params.get('showErosion')
        const hasRiver = this.tileMap.river.has(point)
        if (showErosion && hasRiver) {
            const river = this.tileMap.river.get(point)
            return river.flow.symbol
        }
        return ''
    }

    getOutline(relativePoint) {
        const point = this.rect.wrap(relativePoint)
        if (this.params.get('showRiverSources')) {
            if (this.tileMap.river.isSource(point))
                return true
        }
        return false
    }

    draw({canvas, tilePoint, canvasPoint, size}) {
        const point = this.rect.wrap(tilePoint)
        const showRivers = this.params.get('showRivers')
        const isLand = this.tileMap.surface.isLand(point)
        if (showRivers && isLand) {
            const color = this.riverColor.toHex()
            const patternAxis = this.tileMap.river.getPattern(point)
            const midSize = Math.round(size / 2)
            const midPoint = Point.plusScalar(canvasPoint, midSize)
            for(let offset of patternAxis) {
                const axisPoint = [
                    midPoint[0] + offset[0] * midSize,
                    midPoint[1] + offset[1] * midSize
                ]
                canvas.line(axisPoint, midPoint, 2, color)
            }
        }
    }
}
