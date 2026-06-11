import { Point } from '/src/lib/math/point'
import { PointSet } from '/src/lib/math/point/set'
import { Rect } from '/src/lib/math/rect'
import { Grid } from '/src/lib/grid'
import { Color } from '/src/lib/color'

import {
    buildModel,
    WATER,
    LAND,
    LAND_BORDER,
    WATER_BORDER
} from './model'

const COLOR_MAP = {
    [LAND_BORDER]: '#547f2f',
    [LAND]: '#6aa538',
    [WATER_BORDER]: '#34386e',
    [WATER]: '#0f1235',
}


export class SurfaceChunk {
    #model

    constructor(context) {
        this.size = context.chunkSize
        this.#model = buildModel(context)
    }

    isLand(chunkPoint) {
        const type = this.#model.surface.get(chunkPoint)
        return type == LAND || type == LAND_BORDER
    }

    isBorder(chunkPoint) {
        const type = this.#model.surface.get(chunkPoint)
        return type == WATER_BORDER || type == LAND_BORDER
    }

    draw(props, params) {
        const { canvas, canvasPoint, tileSize } = props
        const chunkSize = this.size
        const size = tileSize / chunkSize
        for (let x = 0; x < chunkSize; x++) {
            const xSize = x * size
            for (let y = 0; y < chunkSize; y++) {
                const chunkPoint = [y, x]
                const type = this.#model.surface.get(chunkPoint)
                // const chunk = this.get(chunkPoint)
                const ySize = y * size
                const chunkCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                const color = COLOR_MAP[type]
                canvas.rect(chunkCanvasPoint, size, color)
            }
        }
    }
}

