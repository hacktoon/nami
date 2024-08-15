import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/point'

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
    Type.boolean('showWireframe', 'Wireframe', {default: false}),
    Type.boolean('showZones', 'Zones', {default: true}),
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
        const showZones = this.params.get('showZones') && tileSize >= 30

        if (showZones) {
            this.drawZone(props, layerColor)
        } else {
            canvas.rect(canvasPoint, tileSize, layerColor.toHex())
        }
        const basin = layers.basin.get(point)
        if (this.params.get('showCityArea')) {
            layers.civil.drawCityArea(point, props)
        }
        if (this.params.get('showLandforms')) {
            layers.relief.draw(point, props, layerColor)
        }
        const showRiver = this.params.get('showRivers') && tileSize >= 8
        if (!showZones && layers.river.has(point) && showRiver) {
            layers.river.draw(point, props, layerColor)
        }
        if (this.params.get('showErosion')) {
            const text = basin.erosion.symbol
            const textColor = layerColor.invert().toHex()
            layers.basin.drawErosion(point, props, layerColor)
            canvas.text(canvasPoint, tileSize, text, textColor)
        }
        if (this.params.get('showRoutes')) {
            layers.civil.drawRoute(point, props)
        }
        if (this.params.get('showWireframe')) {
            layers.basin.drawWireframe(point, props, layerColor)
        }
        if (this.params.get('showCities')) {
            layers.civil.drawCity(point, props)
        }
    }

    drawZone(props, layerColor) {
        const {canvas, tilePoint, canvasPoint, tileSize} = props
        const layers = this.tileMap.layers
        const zone = this.tileMap.getZone(tilePoint)
        const zoneSize = zone.surface.size
        const size = tileSize / zoneSize
        // render zone tiles
        const showRiver = this.params.get('showRivers') && tileSize >= 8
        const river = layers.river.get(tilePoint)
        for (let x=0; x < zoneSize; x++) {
            const xSize = x * size
            for (let y=0; y < zoneSize; y++) {
                const zonePoint = [y, x]
                const ySize = y * size
                const zoneCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                const surface = zone.surface.get(zonePoint)
                const color = showRiver && zone.river.has(zonePoint) && ! surface.water
                              ? river.stretch.color
                              : surface.color
                canvas.rect(zoneCanvasPoint, size, color.toHex())
            }
        }
    }

}
