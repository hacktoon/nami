import { Point } from '/src/lib/math/point'
import { PointSet } from '/src/lib/math/point/set'
import { Rect } from '/src/lib/math/rect'
import { Grid } from '/src/lib/grid'

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
    [WATER_BORDER]: '#2c3062',
    [WATER]: '#282d68',
}


export class SurfaceChunk {
    #model

    constructor(context) {
        this.size = context.chunkSize
        this.#model = buildModel(context)
    }

    get(chunkPoint) {
        const type = this.#model.type.get(chunkPoint)
        const level = this.#model.level.get(chunkPoint)
        return { type, level }
    }

    isLand(chunkPoint) {
        const type = this.#model.type.get(chunkPoint)
        return type == LAND || type == LAND_BORDER
    }

    isBorder(chunkPoint) {
        const type = this.#model.type.get(chunkPoint)
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
                // const chunk = this.get(chunkPoint)
                const ySize = y * size
                const chunkCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                const { type, level } = this.get(chunkPoint)
                let color = COLOR_MAP[type]
                canvas.rect(chunkCanvasPoint, size, color)
            }
        }
    }
}

