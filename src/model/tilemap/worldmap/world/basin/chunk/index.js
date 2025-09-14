import { Point } from '/src/lib/geometry/point'
import { Color } from '/src/lib/color'

import { buildModel } from './model'


export class BasinChunk {
    #model

    constructor(context) {
        this.#model = buildModel(context)
    }

    get(point) {
        return this.#model.grid.get(point)
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
                const level = this.get(chunkPoint)
                if (showErosion && level == 0) {
                    color = '#3f4693'
                } else {
                    color = '#2f367d'
                    if (chunk.surface.isLand(chunkPoint)) {
                        const colorObj = Color.fromHex('#52a83f')
                        color = level < 5 ? colorObj.darken(level * 20) : colorObj
                        color = color.toHex()
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



