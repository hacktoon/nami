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
    #model

    constructor(context) {
        this.size = context.chunkSize
        this.#model = buildModel(context)
    }

    isLand(chunkPoint) {
        return this.#model.get(chunkPoint)
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
                let color = this.isLand(chunkPoint)
                    ? ContinentSurface.color
                    : OceanSurface.color
                canvas.rect(chunkCanvasPoint, size, color.toHex())
            }
        }
    }
}


function buildModel(context) {
    // Generate a boolean grid (land or water)
    const { worldPoint, world, rect, chunkRect, chunkSize } = context
    // Offset noise sampled at (0, 0) position in world map
    // It should have been sampled at chunk's midpoint. Solve this by offseting here.
    const offset = Math.floor(chunkSize / 2)
    const noiseOffset = [offset, offset]
    const relativePoint = Point.multiplyScalar(worldPoint, chunkRect.width)
    const offsetChunkPoint = Point.minus(relativePoint, noiseOffset)
    const noiseRect = Rect.multiply(rect, chunkRect.width)
    const surfaceGrid = Grid.fromRect(chunkRect, chunkPoint => {
        const noisePoint = Point.plus(offsetChunkPoint, chunkPoint)
        const noise = world.noise.get4DChunkOutline(noiseRect, noisePoint)
        return noise > SURFACE_NOISE_RATIO ? REGION_LAND : REGION_WATER
    })
    return surfaceGrid
}
