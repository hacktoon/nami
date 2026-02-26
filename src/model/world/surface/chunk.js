import { Point } from '/src/lib/geometry/point'
import { Rect } from '/src/lib/geometry/rect'
import { Grid } from '/src/lib/grid'

import {
    ContinentSurface,
    OceanSurface,
} from './type'


const SURFACE_NOISE_RATIO = .6
const REGION_WATER = false
const REGION_LAND = true


export class SurfaceChunk {
    #grid

    constructor(context) {
        this.size = context.chunkSize
        this.#grid = buildGrid(context)
    }

    isLand(chunkPoint) {
        return this.#grid.get(chunkPoint)
    }

    draw(props, params) {
        const {canvas, canvasPoint, tileSize} = props
        const chunkSize = this.size
        const size = tileSize / chunkSize
        for (let x=0; x < chunkSize; x++) {
            const xSize = x * size
            for (let y=0; y < chunkSize; y++) {
                const chunkPoint = [y, x]
                const ySize = y * size
                const chunkCanvasPoint = Point.plus(canvasPoint, [ySize, xSize])
                let color = this.isLand(chunkPoint)
                    ? ContinentSurface.color
                    : OceanSurface.color
                canvas.rect(chunkCanvasPoint, size, color.toHex())
            }
        }
    }
}


function buildGrid(context) {
    // Generate a boolean grid (land or water)
    const {worldPoint, world, rect, chunkRect} = context
    const relativePoint = Point.multiplyScalar(worldPoint, chunkRect.width)
    const noiseRect = Rect.multiply(rect, chunkRect.width)
    return Grid.fromRect(chunkRect, chunkPoint => {
        const noisePoint = Point.plus(relativePoint, chunkPoint)
        const noise = world.noise.get4DChunkOutline(noiseRect, noisePoint)
        return noise > SURFACE_NOISE_RATIO ? REGION_LAND : REGION_WATER
    })
}
