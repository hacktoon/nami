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
    [TYPE_WATER]: '#181c46',
    [TYPE_RIVER]: '#383c72',
    [TYPE_MARGIN]: '#57894b', //'#71b13e',
    [TYPE_CURRENT]: '#383c72',
    [TYPE_SHORE]: '#2c3062',
}


export class BasinChunk {
    #model

    constructor(context) {
        this.#model = buildModel(context)
    }

    draw(props, params) {
        const {canvas, canvasPoint, tileSize, chunk} = props
        if (tileSize < 10)
            return

        chunk.surface.draw(props, params)
        const chunkTileSize = tileSize / chunk.size
        const model = this.#model
        for (let x=0; x < chunk.size; x++) {
            const xSize = x * chunkTileSize
            for (let y=0; y < chunk.size; y++) {
                const chunkPoint = [y, x]
                const ySize = y * chunkTileSize
                let chunkCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                const type = model.grid.get(chunkPoint)
                const region = model.regionModel.regionGrid.get(chunkPoint)
                const color = COLOR_MAP[type]
                if (params.get('showErosion')) {
                    canvas.rect(chunkCanvasPoint, chunkTileSize, color)
                }
                const anchor = model.regionModel.anchorMap.get(region)
                if (anchor && Point.equals(anchor, chunkPoint)) {
                    canvas.rect(chunkCanvasPoint, chunkTileSize, '#444')
                }
            }
        }
        // gates
        // model.routes.forEach(({ source, target }) => {
        //     let x = source[0] * chunkTileSize
        //     let y = source[1] * chunkTileSize
        //     let chunkCanvasPoint = Point.plus(canvasPoint, [x, y])
        //     canvas.rect(chunkCanvasPoint, chunkTileSize, '#F0F')

        //     x = target[0] * chunkTileSize
        //     y = target[1] * chunkTileSize
        //     chunkCanvasPoint = Point.plus(canvasPoint, [x, y])
        //     canvas.rect(chunkCanvasPoint, chunkTileSize, '#FF0')
        // })
    }
}
