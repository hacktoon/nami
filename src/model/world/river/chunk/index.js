import { Point } from '/src/lib/geometry/point'
import { Color } from '/src/lib/color'

import { buildRiverGrid } from './model'


export class RiverChunk {
    #riverGrid

    constructor(context) {
        this.#riverGrid = buildRiverGrid(context)
    }

    draw(props, params) {
        const {chunk} = props
        chunk.surface.draw(props, params)
        this.drawRiversOnly(props, params)
    }

    drawRiversOnly(props, params, color='#1d2255') {
        const {canvas, canvasPoint, tilePoint, tileSize, chunk} = props
        const chunkTileSize = tileSize / chunk.size
        if (! params.get('showRivers') || tileSize < 10)
            return
        for (let x=0; x < chunk.size; x++) {
            const xSize = x * chunkTileSize
            for (let y=0; y < chunk.size; y++) {
                const chunkPoint = [y, x]
                const ySize = y * chunkTileSize
                let chunkCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                if (this.#riverGrid.get(chunkPoint)) {
                    canvas.rect(chunkCanvasPoint, chunkTileSize, color)
                }
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