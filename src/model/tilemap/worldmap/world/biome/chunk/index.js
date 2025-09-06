import { Point } from '/src/lib/geometry/point'

import { Biome } from '../type'
import { buildModel } from './model'


export class BiomeChunk {
    #grid

    constructor(context) {
        this.#grid = buildModel(context)

    }

    get(point) {
        let biomeId = this.#grid.get(point)
        return Biome.parse(biomeId)
    }

    draw(props, params) {
        const {canvas, canvasPoint, tileSize, chunk} = props
        const size = tileSize / chunk.size
        // render chunk tiles
        for (let x=0; x < chunk.size; x++) {
            const xSize = x * size
            for (let y=0; y < chunk.size; y++) {
                const chunkPoint = [y, x]
                const ySize = y * size
                const chunkCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                const type = this.get(chunkPoint)
                let color = type.color
                canvas.rect(chunkCanvasPoint, size, color.toHex())
            }
        }
        chunk.river.drawRiversOnly(props, params, '#216384')
    }
}


