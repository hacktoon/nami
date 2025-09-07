import { Point } from '/src/lib/geometry/point'
import { Color } from '/src/lib/color'

import { buildBasinGrid } from './model'


export class BasinChunk {
    #grid

    constructor(context) {
        this.#grid = buildBasinGrid(context)
    }

    has(point) {
        return this.#grid.has(point)
    }

    draw(props, params) {
        const {canvas, canvasPoint, tilePoint, tileSize, world, chunk} = props
        const chunkTileSize = tileSize / chunk.size
        const basin = world.basin.get(tilePoint)
        if (tileSize < 10) return
        const showErosion = params.get('showErosion')
        let color
        for (let x=0; x < chunk.size; x++) {
            const xSize = x * chunkTileSize
            for (let y=0; y < chunk.size; y++) {
                const chunkPoint = [y, x]
                const ySize = y * chunkTileSize
                let chunkCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                if (showErosion && this.has(chunkPoint)) {
                    color = '#3f4693'
                } else {
                    color = '#2f367d'
                    if (chunk.surface.isLand(chunkPoint)) {
                        color = '#52a83f'
                    }

                }
                canvas.rect(chunkCanvasPoint, chunkTileSize, color)
                if (showErosion && Point.equals(basin.midpoint, chunkPoint)) {
                    canvas.rect(chunkCanvasPoint, chunkTileSize, Color.RED.toHex())
                }
            }
        }
    }
}



