import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'
import { clamp } from '/src/lib/number'

import { TileMapDiagram } from '/src/model/tilemap/lib'


const RIVER_SOUCE_COLOR = '#44F'
const RIVER_COLOR = '#00F'

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
        for (let i = 0; i < tileMap.layer.erosion.basinCount; i ++) {
            this.erosionColors.set(i, new Color())
        }
    }

    getByBasin(point) {
        const erosion = this.tileMap.layer.erosion.get(point)
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
        const point = this.rect.wrap(relativePoint)
        const showLandBorder = this.params.get('showLandBorder')
        const showWaterBorder = this.params.get('showWaterBorder')
        const showRelief = this.params.get('showRelief')
        const showTemperature = this.params.get('showTemperature')
        const showRain = this.params.get('showRain')
        const surface = this.tileMap.layer.surface.get(point)
        const relief = this.tileMap.layer.relief.get(point)
        const isBorder = this.tileMap.layer.relief.isBorder(point)
        let color = surface.color

        if (showRelief) {
            color = relief.color
        }
        if (showTemperature && ! surface.water) {
            const temperature = this.tileMap.layer.temperature.get(point)
            color = temperature.color
        }
        if (showRain && ! surface.water) {
            const rain = this.tileMap.layer.rain.get(point)
            color = rain.color
        }
        if (showLandBorder && isBorder && !surface.water) {
            color = color.darken(40)
        }
        if (showWaterBorder && isBorder && surface.water) {
            color = color.brighten(40)
        }
        if (this.params.get('showBasins')) {
            const river = this.tileMap.layer.river.get(point)
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
        const isLand = this.tileMap.layer.surface.isLand(point)
        if (showErosion && isLand) {
            const erosion = this.tileMap.layer.erosion.get(point)
            return erosion.flow.symbol
        }
        return ''
    }

    draw(props) {
        const point = this.rect.wrap(props.tilePoint)
        const isLand = this.tileMap.layer.surface.isLand(point)
        const isRiver = this.tileMap.layer.river.has(point)
        const isRiverSource = this.tileMap.layer.river.isSource(point)
        if (isLand && isRiver && this.params.get('showRivers')) {
            this.#drawRiver(props)
        }
        if (isRiverSource && this.params.get('showRiverSources')) {
            this.#drawRiverSource(props)
        }
    }

    #drawRiverSource({canvas, tilePoint, canvasPoint, size}) {
        const midSize = Math.round(size / 2)
        const offset = midSize - Math.round(midSize / 2)
        const point = Point.plusScalar(canvasPoint, offset)
        canvas.rect(point, midSize, RIVER_SOUCE_COLOR)
    }

    #drawRiver({canvas, tilePoint, canvasPoint, size}) {
        const point = this.rect.wrap(tilePoint)
        const river = this.tileMap.layer.river.get(point)
        const riverWidth = this.#buildRiverWidth(river, size)
        const midSize = Math.round(size / 2)
        const midCanvasPoint = Point.plusScalar(canvasPoint, midSize)
        const meanderOffsetPoint = this.#buildMeanderOffsetPoint(river, size)
        const meanderPoint = Point.plus(canvasPoint, meanderOffsetPoint)
        for(let axisOffset of river.flowDirections) {
            // build a point for each present edge midpoint of a tile square
            const edgeMidPoint = [
                midCanvasPoint[0] + axisOffset[0] * midSize,
                midCanvasPoint[1] + axisOffset[1] * midSize
            ]
            canvas.line(edgeMidPoint, meanderPoint, riverWidth, RIVER_COLOR)
        }
    }

    #buildMeanderOffsetPoint(river, size) {
        const percentage = river.meander
        return Point.multiplyScalar(percentage, size)
    }

    #buildRiverWidth(river, size) {
        const maxWidth = Math.floor(size / 6)
        let width = Math.floor(size / 2)
        if (river.flowRate < 4) {  // creeks
            width = 1
        }
        else if (river.flowRate < 20) { // medium rivers
            width = Math.floor(size / 15)
        }
        return clamp(width, 1, maxWidth)
    }
}
