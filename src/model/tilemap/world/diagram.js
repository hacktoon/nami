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
    Type.boolean('showErosion', 'Erosion', {default: false}),
    Type.boolean('showRivers', 'Rivers', {default: true}),
    Type.boolean('showLakes', 'Lakes', {default: true}),
    Type.boolean('showCities', 'Cities', {default: false}),
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

    drawBackground(relativePoint) {
        const layers = this.tileMap.layers
        const point = this.rect.wrap(relativePoint)
        const layerName = this.params.get('showLayer')

        if (layers.landform.has(point) && this.params.get('showLandforms')) {
            const landform = layers.landform.get(point)
            return landform.color
        }
        return layers[layerName].getColor(point)
    }

    draw(props) {
        const {canvasPoint, tileSize} = props
        const layers = this.tileMap.layers
        const point = this.rect.wrap(props.tilePoint)
        const isLand = layers.surface.isLand(point)
        const showRiver = tileSize >= 15 && this.params.get('showRivers')
        if (layers.river.has(point) && showRiver) {
            layers.river.draw(point, props)
        }
        if (this.params.get('showCities')) {
            layers.topo.draw(props)
        }
        if (this.params.get('showLakes') && layers.lake.has(point)) {
            const lake = layers.lake.get(point)
            drawLake(lake, props)
        }
        if (isLand && this.params.get('showErosion')) {
            const basin = this.tileMap.layers.basin.get(point)
            const text = basin.erosion.symbol
            props.canvas.text(canvasPoint, tileSize, text, '#000')
        }
    }
}
