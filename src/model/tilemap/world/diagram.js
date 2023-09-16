import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'
import { clamp } from '/src/lib/number'

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
        if (this.params.get('showBlocks') && tileSize >= 20) {
            const resolution = tileSize >= 90 ? 9 : 3
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
                const blockCanvasPoint = Point.plus(canvasPoint, [y * size, xSize])
                let block = blockMap.get([y, x])
                let hexColor
                if (block == 0) {
                    hexColor = '#282e6e'
                } else if (block == 1) {
                    hexColor = '#426e1e'
                } else if (block == 2) {
                    hexColor = '#6a914b'
                } else if (block == 3) {
                    hexColor = '#b1c5a0'
                } else if (block == 4) {
                    hexColor = '#cadbbc'
                }
                canvas.rect(blockCanvasPoint, size, hexColor)
            }
        }
    }

    #buildColor(noise) {
        const octet = parseInt(noise * 255, 10)
        const color = clamp(octet, 0, 255)
        return new Color(color, color, color).toHex()
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
