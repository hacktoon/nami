import { Point } from '/src/lib/geometry/point'
import { Color } from '/src/lib/color'
import { buildRiverGrid } from './model'


export class RiverChunk {
    #riverGrid

    constructor(context) {
        this.#riverGrid = buildRiverGrid(context)
    }

    has(point) {
        return this.#riverGrid.has(point)
    }

    draw(props, params) {
        const {chunk} = props
        chunk.surface.draw(props, params)
        this.drawRiversOnly(props, params)
    }

    drawRiversOnly(props, params, color='#2f367d') {
        const {canvas, canvasPoint, tilePoint, tileSize, world, chunk} = props
        const chunkTileSize = tileSize / chunk.size
        const basin = world.basin.get(tilePoint)
        if (! params.get('showRivers') || tileSize < 10) return
        for (let x=0; x < chunk.size; x++) {
            const xSize = x * chunkTileSize
            for (let y=0; y < chunk.size; y++) {
                const chunkPoint = [y, x]
                const ySize = y * chunkTileSize
                let chunkCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                if (this.has(chunkPoint)) {
                    canvas.rect(chunkCanvasPoint, chunkTileSize, color)
                }
                if (Point.equals(basin.midpoint, chunkPoint)) {
                    canvas.rect(chunkCanvasPoint, chunkTileSize, Color.RED.toHex())
                }
            }
        }
    }
}



