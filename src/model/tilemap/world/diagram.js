import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'

import { TileMapDiagram } from '/src/model/tilemap/lib'


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
    Type.boolean('showErosion', 'Erosion', {default: false}),
    Type.boolean('showRivers', 'Rivers', {default: true}),
    Type.boolean('showCities', 'Cities', {default: false}),
    Type.boolean('showCityArea', 'CityArea', {default: false}),
    Type.boolean('showRoutes', 'Routes', {default: false}),
    Type.boolean('showLandforms', 'Landforms', {default: false}),
)

export class WorldTileMapDiagram extends TileMapDiagram {
    static schema = SCHEMA

    static create(tileMap, params) {
        return new WorldTileMapDiagram(tileMap, params)
    }

    constructor(tileMap, params) {
        super(tileMap)
        this.params = params
    }

    draw(props) {
        const {canvas, canvasPoint, tileSize, tilePoint} = props
        const layers = this.tileMap.layers
        const point = this.rect.wrap(tilePoint)
        const layerName = this.params.get('showLayer')
        const layerColor = layers[layerName].getColor(point)

        canvas.rect(canvasPoint, tileSize, layerColor.toHex())

        const isLand = layers.surface.isLand(point)
        if (isLand && this.params.get('showErosion')) {
            const basin = layers.basin.get(point)
            const text = basin.erosion.symbol
            canvas.text(canvasPoint, tileSize, text, '#000')
        }
        if (this.params.get('showLandforms')) {
            layers.relief.draw(point, props, layerColor)
        }
        const showRiver = this.params.get('showRivers') && tileSize >= 8
        if (this.params.get('showCityArea')) {
            layers.civil.drawCityArea(point, props)
        }
        if (layers.river.has(point) && showRiver) {
            layers.river.draw(point, props, layerColor)
        }
        if (this.params.get('showCities')) {
            layers.civil.drawCity(point, props)
        }
        if (this.params.get('showRoutes')) {
            layers.civil.drawRoute(point, props)
        }
    }
}
