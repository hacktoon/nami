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
    Type.boolean('showRivers', 'Rivers', {default: true}),
    Type.boolean('showCities', 'Cities', {default: false}),
    Type.boolean('showBlocks', 'Blocks', {default: true}),
    // Type.boolean('showLakes', 'Lakes', {default: true}),
    // Type.boolean('showLandforms', 'Landforms', {default: false}),
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
        const showRiver = tileSize >= 8 && this.params.get('showRivers')
        const layerName = this.params.get('showLayer')
        const layerColor = layers[layerName].getColor(point)
        // draw background rect
        canvas.rect(canvasPoint, tileSize, layerColor.toHex())
        if (props.tileSize >= 170 && this.params.get('showBlocks')) {
            this.drawBlock(props, layers)
        }
        if (layers.river.has(point) && showRiver) {
            layers.river.draw(point, props)
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

    drawBlock(props, layers) {
        const {canvas, tilePoint, canvasPoint, tileSize} = props
        const blockMap = this.tileMap.getBlock(tilePoint)
        const size = tileSize / blockMap.size
        const reliefColor = layers.relief.get(tilePoint).color
        for (let x=0; x < blockMap.size; x++) {
            const xSize = x * size
            for (let y=0; y < blockMap.size; y++) {
                const block = blockMap.get([y, x])
                const blockCanvasPoint = Point.plus(canvasPoint, [y*size, xSize])
                const color = block !== 0 ? reliefColor.darken(40) : reliefColor
                canvas.rect(blockCanvasPoint, size, color.toHex())
            }
        }
    }

    // if (layers.landform.has(point) && this.params.get('showLandforms')) {
    //     layers.landform.draw(point, props)
    // }
    // if (this.params.get('showLakes') && layers.lake.has(point)) {
    //     layers.lake.draw(point, props)
    // }
}
