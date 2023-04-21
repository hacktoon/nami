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

    draw(props) {
        const {canvas, canvasPoint, tileSize, tilePoint} = props
        const layers = this.tileMap.layers
        const point = this.rect.wrap(tilePoint)
        const isLand = layers.surface.isLand(point)
        const showRiver = tileSize >= 15 && this.params.get('showRivers')
        const layerName = this.params.get('showLayer')
        const bgColor = layers[layerName].getColor(point)
        // draw background rect
        canvas.rect(canvasPoint, tileSize, bgColor.toHex())
        if (props.tileSize >= 350) {
            this.drawBlock(props)
        }
        if (layers.landform.has(point) && this.params.get('showLandforms')) {
            layers.landform.draw(point, props)
        }
        if (layers.river.has(point) && showRiver) {
            layers.river.draw(point, props)
        }
        if (this.params.get('showLakes') && layers.lake.has(point)) {
            layers.lake.draw(point, props)
        }
        if (this.params.get('showCities')) {
            layers.topo.draw(point, props)
        }
        if (isLand && this.params.get('showErosion')) {
            const basin = layers.basin.get(point)
            const text = basin.erosion.symbol
            canvas.text(canvasPoint, tileSize, text, '#000')
        }
    }

    drawBlock(props) {
        const {canvas, canvasPoint, tileSize} = props
        const blockMap = this.tileMap.getBlock(props.tilePoint)
        const size = Math.round(tileSize/10)
        canvas.rect(canvasPoint, size, '#020')
    }
}
