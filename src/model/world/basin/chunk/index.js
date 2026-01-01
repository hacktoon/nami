import { Point } from '/src/lib/geometry/point'
import { Color } from '/src/lib/color'
import { Direction } from '/src/lib/direction'

import { buildModel } from './model'
import { Basin } from '../type'


export class BasinChunk {
    #model

    constructor(context) {
        this.#model = buildModel(context)
    }

    get(point) {
        const typeId = this.#model.typeGrid.get(point)
        const directionId = this.#model.pointflowMap.get(point)
        const direction = directionId ? Direction.fromId(directionId) : null
        return {
            type: Basin.parse(typeId),
            direction
        }
    }

    draw(props, params) {
        const {canvas, canvasPoint, tileSize, tilePoint, world, chunk} = props
        const chunkTileSize = tileSize / chunk.size
        if (tileSize < 10) return
        for (let x=0; x < chunk.size; x++) {
            const xSize = x * chunkTileSize
            for (let y=0; y < chunk.size; y++) {
                const chunkPoint = [y, x]
                const ySize = y * chunkTileSize
                const basin = world.basin.get(tilePoint)
                let chunkCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                const {type} = this.get(chunkPoint)
                canvas.rect(chunkCanvasPoint, chunkTileSize, type.color.toHex())
                if (Point.equals(basin.midpoint, chunkPoint)) {
                    canvas.rect(chunkCanvasPoint, chunkTileSize, Color.RED.toHex())
                }
            }
        }
    }
}



