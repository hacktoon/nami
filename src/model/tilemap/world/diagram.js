import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Color } from '/src/lib/color'

import { TileMapDiagram } from '/src/model/tilemap/lib'
import {
    drawCity, drawCapital, drawLake, drawRiver,
    drawDungeon
} from '/src/model/tilemap/lib/icon'


const RIVER_SOUCE_COLOR = '#44F'
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
    Type.boolean('showCities', 'Cities', {default: true}),
    Type.boolean('showDungeons', 'Dungeons', {default: true}),
)


class ColorMap {
    constructor(tileMap) {
        this.tileMap = tileMap
        this.basinColors = new Map()
        for (let i = 0; i < tileMap.layers.basin.count; i ++) {
            this.basinColors.set(i, new Color())
        }
    }

    getByBasin(point) {
        const basin = this.tileMap.layers.basin.get(point)
        return this.basinColors.get(basin.basin)
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
        const isBorder = this.tileMap.layers.surface.isBorder(point)
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
            const basin = this.tileMap.layers.basin.get(point)
            return basin.flow.symbol
        }
        return ''
    }

    draw(props) {
        const layers = this.tileMap.layers
        const point = this.rect.wrap(props.tilePoint)
        const isLand = layers.surface.isLand(point)
        const isRiver = layers.hydro.has(point)
        const isRiverSource = layers.basin.isRiverSource(point)
        const isLake = layers.hydro.isLake(point)
        const isDungeon = layers.topo.isDungeon(point)
        const isCity = layers.topo.isCity(point)
        if (isLand && isRiver && this.params.get('showRivers')) {
            const river = this.tileMap.layers.hydro.get(point)
            drawRiver(river, props)
        }
        if (isCity && this.params.get('showCities')) {
            if (layers.topo.isCapital(point)) {
                drawCapital(props)
            } else
                drawCity(props)
        }
        if (isRiverSource && this.params.get('showRiverSources')) {
            this.#drawRiverSource(props)
        }
        if (isLake && this.params.get('showLakes')) {
            drawLake(props)
        }
        if (isDungeon && this.params.get('showDungeons')) {
            drawDungeon(props)
        }
    }

    #drawRiverSource({canvas, canvasPoint, size}) {
        const midSize = Math.round(size / 4)
        canvas.rect(canvasPoint, midSize, RIVER_SOUCE_COLOR)
    }
}
