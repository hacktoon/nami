import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Color } from '/src/lib/color'

import { TileMapDiagram } from '/src/model/tilemap/lib'
import {
    drawCity, drawCapital, drawLake, drawRiver,
    drawDungeon, drawRiverSource
} from '/src/model/tilemap/lib/icon'


const DEFAULT_LAYER = 'biome'
const LAYERS = [
    {value: 'surface', label: 'Surface'},
    {value: 'climate', label: 'Climate'},
    {value: 'rain', label: 'Rain'},
    {value: 'basin', label: 'Basin'},
    {value: 'relief', label: 'Relief'},
    {value: 'biome', label: 'Biome'},
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
    Type.boolean('showLandforms', 'Landforms', {default: true}),
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
        const layers = this.tileMap.layers
        const point = this.rect.wrap(relativePoint)
        const layer = params.get('showLayer')
        const surface = layers.surface.get(point)
        const isBorder = layers.surface.isBorder(point)
        let color = surface.color

        if (isBorder && params.get('showBorders')) {
            return surface.water ? Color.BLUE : Color.PURPLE
        }
        if (layers.landform.has(point) && params.get('showLandforms')) {
            const landform = layers.landform.get(point)
            return landform.color
        }
        if (layer === 'surface') return color
        if (layer === 'relief') {
            const relief = layers.relief.get(point)
            color = relief.color
        }
        if (layer === 'climate') {
            const climate = layers.climate.get(point)
            color = surface.water
                    ? climate.color.average(Color.BLACK).average(Color.DARKBLUE)
                    : climate.color
        }
        if (layer === 'rain') {
            const rain = layers.rain.get(point)
            color = surface.water ? Color.DARKBLUE : rain.color
        }
        if (layer === 'basin') {
            const river = layers.river.get(point)
            if (river && !surface.water) {
                color = this.colorMap.getByBasin(point)
            }
        }
        if (layer === 'biome') {
            const biome = layers.biome.get(point)
            color = biome.color
        }
        return color
    }

    draw(props) {
        const layers = this.tileMap.layers
        const point = this.rect.wrap(props.tilePoint)
        const isLand = layers.surface.isLand(point)
        const isRiver = layers.river.has(point)
        const isDungeon = layers.topo.isDungeon(point)
        const isCity = layers.topo.isCity(point)
        const river = this.tileMap.layers.river.get(point)
        if (isLand && isRiver && this.params.get('showRivers')) {
            drawRiver(river, props)
        }
        if (this.params.get('showRiverSources')) {
            if (isRiver && layers.basin.isDivide(point)) {
                drawRiverSource(river, props)
            }
        }
        if (isCity && this.params.get('showCities')) {
            if (layers.topo.isCapital(point)) {
                drawCapital(props)
            } else {
                drawCity(props)
            }
        }
        if (this.params.get('showLakes') && layers.lake.has(point)) {
            const lake = layers.lake.get(point)
            drawLake(lake, props)

        }
        if (isDungeon && this.params.get('showDungeons')) {
            drawDungeon(props)
        }
    }

    getText(relativePoint) {
        const point = this.rect.wrap(relativePoint)
        const isLand = this.tileMap.layers.surface.isLand(point)
        if (isLand && this.params.get('showErosion')) {
            const basin = this.tileMap.layers.basin.get(point)
            return basin.erosion.symbol
        }
        return ''
    }
}
