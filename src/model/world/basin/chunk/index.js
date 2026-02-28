import { Point } from '/src/lib/geometry/point'
import { Color } from '/src/lib/color'

import {
    buildModel,
    TYPE_LAND,
    TYPE_RIVER,
    TYPE_WATER,
    TYPE_CURRENT
} from './model'


export class BasinChunk {
    #model

    constructor(context) {
        this.#model = buildModel(context)
    }

    draw(props, params) {
        const {canvas, canvasPoint, tileSize, chunk} = props
        const chunkTileSize = tileSize / chunk.size
        const colorMap = {
            [TYPE_LAND]: '#6fbc58',
            [TYPE_WATER]: '#272c66',
            [TYPE_RIVER]: '#272c66',
            [TYPE_CURRENT]: '#313777',
        }
        if (tileSize < 10) return
        for (let x=0; x < chunk.size; x++) {
            const xSize = x * chunkTileSize
            for (let y=0; y < chunk.size; y++) {
                const chunkPoint = [y, x]
                const ySize = y * chunkTileSize
                let chunkCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                const type = this.#model.get(chunkPoint)
                const color = colorMap[type]
                canvas.rect(chunkCanvasPoint, chunkTileSize, color)
                // if (Point.equals(basin.midpoint, chunkPoint)) {
                //     canvas.rect(chunkCanvasPoint, chunkTileSize, Color.RED.toHex())
                // }
            }
        }
    }
}



// for (let x=0; x < chunk.size; x++) {
        //     const xSize = x * chunkTileSize
        //     for (let y=0; y < chunk.size; y++) {
        //         const chunkPoint = [y, x]
        //         const ySize = y * chunkTileSize
        //         const basin = world.basin.get(tilePoint)
        //         let chunkCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
        //         const {type} = this.get(chunkPoint)
        //         canvas.rect(chunkCanvasPoint, chunkTileSize, type.color.toHex())
        //         if (Point.equals(basin.midpoint, chunkPoint)) {
        //             canvas.rect(chunkCanvasPoint, chunkTileSize, Color.BROWN.toHex())
        //         }
        //     }
        // }