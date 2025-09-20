import { Point } from '/src/lib/geometry/point'
import { Color } from '/src/lib/color'

import { buildModel } from './model'
import { Basin } from '../type'


export class BasinChunk {
    #model

    constructor(context) {
        this.#model = buildModel(context)
    }

    get(point) {
        const typeId = this.#model.typeGrid.get(point)
        return {
            level: this.#model.grid.get(point),
            type: Basin.parse(typeId),
        }
    }

    draw(props, params) {
        const {canvas, canvasPoint, tilePoint, tileSize, world, chunk} = props
        const chunkTileSize = tileSize / chunk.size
        if (tileSize < 10) return
        let color
        for (let x=0; x < chunk.size; x++) {
            const xSize = x * chunkTileSize
            for (let y=0; y < chunk.size; y++) {
                const chunkPoint = [y, x]
                const ySize = y * chunkTileSize
                let chunkCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                const {type} = this.get(chunkPoint)
                color = type.color.toHex()
                canvas.rect(chunkCanvasPoint, chunkTileSize, color)
                // if (showErosion && Point.equals(basin.midpoint, chunkPoint)) {
                //     canvas.rect(chunkCanvasPoint, chunkTileSize, Color.RED.toHex())
                // }
            }
        }
    }
}



