import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Color } from '/src/lib/color'

import { TileMapDiagram } from '/src/model/tilemap/lib'
import { drawLake, drawRiver } from '/src/model/tilemap/lib/icon'


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
    Type.boolean('showErosion', 'Erosion', {default: false}),
    Type.boolean('showRivers', 'Rivers', {default: true}),
    Type.boolean('showLakes', 'Lakes', {default: true}),
    Type.boolean('showCities', 'Cities', {default: false}),
    Type.boolean('showLandforms', 'Landforms', {default: false}),
)


class ColorMap {
    constructor(tileMap) {
        this.tileMap = tileMap

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

        if (layers.landform.has(point) && params.get('showLandforms')) {
            const landform = layers.landform.get(point)
            return landform.color
        }
        if (layer === 'relief') return layers.relief.getColor(point)
        if (layer === 'climate') return layers.climate.getColor(point)
        if (layer === 'rain') return layers.rain.get(point).color
        if (layer === 'basin') return layers.basin.getColor(point)
        if (layer === 'biome') return layers.biome.getColor(point)

        // surface layer is default
        const showBorders = params.get('showBorders')
        return layers.surface.getColor(point, showBorders)
    }

    draw(props) {
        const layers = this.tileMap.layers
        const point = this.rect.wrap(props.tilePoint)
        const river = this.tileMap.layers.river.get(point)
        const showRiver = props.tileSize >= 15 && this.params.get('showRivers')
        if (layers.river.has(point) && showRiver) {
            drawRiver(river, props)
        }
        if (this.params.get('showCities')) {
            layers.topo.draw(props)
        }
        if (this.params.get('showLakes') && layers.lake.has(point)) {
            const lake = layers.lake.get(point)
            drawLake(lake, props)
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
