import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'
import { clamp } from '/src/lib/number'

import { TileMapDiagram } from '/src/model/tilemap/lib'


const RIVER_SOUCE_COLOR = '#44F'
const RIVER_COLOR = '#00F'
const DEFAULT_LAYER = 'biome'
const LAYERS = [
    {value: 'surface', label: 'Surface'},
    {value: 'relief', label: 'Relief'},
    {value: 'temperature', label: 'Temperature'},
    {value: 'rain', label: 'Rain'},
    {value: 'biome', label: 'Biome'},
    {value: 'basin', label: 'Basin'},
]

const SCHEMA = new Schema(
    'WorldTileMapDiagram',
    Type.selection('showLayer', 'Layer', {default: DEFAULT_LAYER, options: LAYERS}),
    Type.boolean('showBorders', 'Borders', {default: false}),
    Type.boolean('showRiverSources', 'River sources', {default: false}),
    Type.boolean('showErosion', 'Erosion', {default: false}),
    Type.boolean('showRivers', 'Rivers', {default: true}),
    Type.boolean('showLakes', 'Lakes', {default: true}),
    Type.boolean('showCities', 'Cities', {default: false}),
)


class ColorMap {
    constructor(tileMap) {
        this.tileMap = tileMap
        this.basinColors = new Map()
        for (let i = 0; i < tileMap.layers.erosion.basinCount; i ++) {
            this.basinColors.set(i, new Color())
        }
    }

    getByBasin(point) {
        const erosion = this.tileMap.layers.erosion.get(point)
        return this.basinColors.get(erosion.basin)
    }
}


export class WorldTileMapDiagram extends TileMapDiagram {
    static schema = SCHEMA
    static colorMap = ColorMap

    static create(tileMap, colorMap, params) {
        return new WorldTileMapDiagram(tileMap, colorMap, params)
    }

    constructor(tileMap, colorMap, params) {
        super(tileMap)
        this.colorMap = colorMap
        this.params = params
    }

    get(relativePoint) {
        const params = this.params
        const point = this.rect.wrap(relativePoint)
        const layer = params.get('showLayer')
        const surface = this.tileMap.layers.surface.get(point)
        const isBorder = this.tileMap.layers.relief.isBorder(point)
        let color = surface.color

        if (isBorder && params.get('showBorders')) {
            return surface.water ? Color.BLUE : Color.PURPLE
        }
        if (layer === 'surface') return color
        if (layer === 'relief') {
            const relief = this.tileMap.layers.relief.get(point)
            color = relief.color
        }
        if (layer === 'temperature') {
            const temperature = this.tileMap.layers.temperature.get(point)
            color = surface.water ? temperature.color : temperature.color
        }
        if (layer === 'rain') {
            const rain = this.tileMap.layers.rain.get(point)
            color = surface.water ? rain.color : rain.color
        }
        if (layer === 'basin') {
            const river = this.tileMap.layers.hydro.get(point)
            if (river && !surface.water) {
                color = this.colorMap.getByBasin(point)
            }
        }
        if (layer === 'biome') {
            const biome = this.tileMap.layers.biome.get(point)
            color = biome.color
        }
        return color
    }

    getText(relativePoint) {
        const point = this.rect.wrap(relativePoint)
        const isLand = this.tileMap.layers.surface.isLand(point)
        if (isLand && this.params.get('showErosion')) {
            const erosion = this.tileMap.layers.erosion.get(point)
            return erosion.flow.symbol
        }
        return ''
    }

    draw(props) {
        const layers = this.tileMap.layers
        const point = this.rect.wrap(props.tilePoint)
        const isLand = layers.surface.isLand(point)
        const isRiver = layers.hydro.has(point)
        const isRiverSource = layers.hydro.isRiverSource(point)
        const isLake = layers.hydro.isLake(point)
        const isCity = layers.topo.has(point)
        if (isLand && isRiver && this.params.get('showRivers')) {
            this.#drawRiver(props)
        }
        if (isCity && this.params.get('showCities')) {
            drawCity(props)
        }
        if (isRiverSource && this.params.get('showRiverSources')) {
            this.#drawRiverSource(props)
        }
        if (isLake && this.params.get('showLakes')) {
            drawLake(props)
        }
    }

    #drawRiverSource({canvas, canvasPoint, size}) {
        const midSize = Math.round(size / 4)
        canvas.rect(canvasPoint, midSize, RIVER_SOUCE_COLOR)
    }

    #drawRiver({canvas, tilePoint, canvasPoint, size}) {
        const point = this.rect.wrap(tilePoint)
        const river = this.tileMap.layers.hydro.get(point)
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
        else if (river.flowRate < 24) { // medium rivers
            width = Math.floor(size / 15)
        }
        return clamp(width, 1, maxWidth)
    }
}


function drawLake(baseProps) {
    const template = [
        [0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0],
        [1, 1, 1, 1, 1],
        [0, 1, 1, 1, 0],
        [0, 0, 1, 0, 0],
    ]
    const colorMap = {1: Color.BLUE}
    const midSize = Math.round(baseProps.size / 2)
    const midPoint = Point.plusScalar(baseProps.canvasPoint, midSize)
    const props = {...baseProps, canvasPoint: midPoint}
    drawTemplate(props, template, colorMap)
}


function drawCity(props) {
    const template = [
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [1, 1, 1, 1, 1],
        [0, 2, 2, 2, 0],
        [0, 2, 3, 2, 0],
    ]
    const colorMap = {
        1: Color.DARKRED,
        2: Color.LIGHTGRAY,
        3: Color.BLACK,
    }
    drawTemplate(props, template, colorMap)
}


function drawTemplate(props, template, colorMap) {
    const {canvas, canvasPoint, size} = props
    const pixelSize = Math.floor(size / 2 / template.length)
    for (let y = 0; y < template.length; y++) {
        for (let x = 0; x < template[y].length; x++) {
            const pixel = template[y][x]
            if (pixel === 0) continue
            const color = colorMap[pixel]
            const offsetPoint = [pixelSize * x, pixelSize * y]
            const point = Point.plus(canvasPoint, offsetPoint)
            canvas.rect(point, pixelSize, color.toHex())
        }
    }
}