import { Point } from '/src/lib/geometry/point'
import { Color } from '/src/lib/color'

import {
    buildModel,
    TYPE_LAND,
    TYPE_RIVER,
    TYPE_WATER,
    TYPE_CURRENT,
    TYPE_MARGIN,
    TYPE_SHORE,
} from './model'


const COLOR_MAP = {
    [TYPE_LAND]: '#71b13e',
    [TYPE_WATER]: '#272c66',
    [TYPE_RIVER]: '#3e7931',
    [TYPE_CURRENT]: '#0f1235',
    [TYPE_MARGIN]: '#65a133',
    // [TYPE_MARGIN]: '#71b13e',
    [TYPE_SHORE]: '#1b1f52',
}


export class BasinChunk {
    #model

    constructor(context) {
        this.#model = buildModel(context)
    }

    draw(props, params) {
        const {canvas, canvasPoint, tileSize, chunk} = props
        const chunkTileSize = tileSize / chunk.size

        if (tileSize < 10) return
        if (! params.get('showErosion')) {
            chunk.surface.draw(props, params)
            return
        }
        const model = this.#model
        for (let x=0; x < chunk.size; x++) {
            const xSize = x * chunkTileSize
            for (let y=0; y < chunk.size; y++) {
                const chunkPoint = [y, x]
                const ySize = y * chunkTileSize
                let chunkCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                const type = model.grid.get(chunkPoint)
                const region = model.regionModel.regionGrid.get(chunkPoint)
                const anchor = model.regionModel.anchorMap.get(region)
                const color = COLOR_MAP[type]
                canvas.rect(chunkCanvasPoint, chunkTileSize, color)

                if (anchor && Point.equals(anchor, chunkPoint)) {
                    canvas.rect(chunkCanvasPoint, chunkTileSize, Color.RED.toHex())
                }
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