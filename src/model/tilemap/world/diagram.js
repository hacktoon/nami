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
        const showRiver = tileSize >= 8 && this.params.get('showRivers')
        const layerName = this.params.get('showLayer')
        const layerColor = layers[layerName].getColor(point)
        canvas.rect(canvasPoint, tileSize, layerColor.toHex())
        // if (props.tileSize >= 50) {
        //     this.drawSubtile(props, layers)
        // } else {
        // }
        if (props.tileSize >= 90 && this.params.get('showBlocks')) {
            this.drawBlock(props, layers)
        }
        if (isLand && this.params.get('showErosion')) {
            const basin = layers.basin.get(point)
            const text = basin.erosion.symbol
            canvas.text(canvasPoint, tileSize, text, '#000')
        }
        if (layers.river.has(point) && showRiver) {
            layers.river.draw(point, props, layerColor)
        }
        if (layers.surface.isLand(point) && this.params.get('showLandforms')) {
            layers.relief.draw(point, props, layerColor)
        }
        if (this.params.get('showCities')) {
            layers.topo.draw(point, props)
        }
    }

    drawBlock(props, layers) {
        const {canvas, tilePoint, canvasPoint, tileSize} = props
        const blockMap = this.tileMap.getBlock(tilePoint)
        const blockSize = blockMap.size
        const size = tileSize / blockSize
        // render sub tiles
        for (let x=0; x < blockSize; x++) {
            const xSize = x * size
            for (let y=0; y < blockSize; y++) {
                const block = blockMap.get([y, x])
                const blockCanvasPoint = Point.plus(canvasPoint, [y * size, xSize])
                let hexColor
                if (block > .98)
                    hexColor = '#bfcfa5'
                else if (block > .9)
                    hexColor = '#b4b192'
                else if (block > .6)
                    hexColor = '#71b13e'
                else if (block > .55)
                    hexColor = '#538629'
                else if (block > .4)
                    hexColor = '#282e6e'
                else
                    hexColor = '#1d2255'
                // const color = Color.fromHex(hexColor).
                canvas.rect(blockCanvasPoint, size, hexColor)
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
