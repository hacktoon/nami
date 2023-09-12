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
        // TODO: refactor resolution calc
        // if (tileSize >= 110) resolution = 9
        if (this.params.get('showBlocks') && tileSize >= 20) {
            const resolution = Math.floor(tileSize / 10)
            const blockMap = this.tileMap.getBlock(tilePoint, resolution)
            this.drawBlock(props, blockMap)
        } else {
            canvas.rect(canvasPoint, tileSize, layerColor.toHex())
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

    drawBlock(props, blockMap) {
        const {canvas, tilePoint, canvasPoint, tileSize} = props
        const point = this.rect.wrap(tilePoint)
        const layers = this.tileMap.layers
        const resolution = blockMap.resolution
        const size = tileSize / resolution

        // render block tiles
        for (let x=0; x < resolution; x++) {
            const xSize = x * size
            for (let y=0; y < resolution; y++) {
                const block = blockMap.get([y, x])
                const blockCanvasPoint = Point.plus(canvasPoint, [y * size, xSize])
                let hexColor
                if (block > .98)
                    hexColor = '#bfcfa5'
                else if (block > .9)
                    hexColor = '#b4b192'
                else if (block > .7)
                    hexColor = '#71b13e'
                else if (block > .6)
                    hexColor = '#538629'
                else if (block > .5)
                    hexColor = '#282e6e'
                else
                    hexColor = '#1d2255'
                // const color = Color.fromHex(hexColor).
                canvas.rect(blockCanvasPoint, size, hexColor)
            }
        }
    }

    buildLandBlock(block) {

    }

    // if (layers.landform.has(point) && this.params.get('showLandforms')) {
    //     layers.landform.draw(point, props)
    // }
    // if (this.params.get('showLakes') && layers.lake.has(point)) {
    //     layers.lake.draw(point, props)
    // }
}
