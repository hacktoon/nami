import { Point } from '/src/lib/geometry/point'
import { Rect } from '/src/lib/geometry/rect'
import { Grid } from '/src/lib/grid'

import {
    ContinentSurface,
    OceanSurface,
} from './type'


const SURFACE_NOISE_RATIO = .6
const WATER = 1
const LAND = 2
const LAND_BORDER = 3
const WATER_BORDER = 4

const COLOR_MAP = {
    [LAND]: '#71b13e',
    [WATER]: '#272c66',
    [LAND_BORDER]: '#3e7931',
    [WATER_BORDER]: '#0f1235',
}


export class SurfaceChunk {
    #model

    constructor(context) {
        this.size = context.chunkSize
        this.#model = buildModel(context)
    }

    isLand(chunkPoint) {
        const type = this.#model.get(chunkPoint)
        return type == LAND || type == LAND_BORDER
    }

    isBorder(chunkPoint) {
        const type = this.#model.get(chunkPoint)
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
                const id = this.#model.get(chunkPoint)
                let color = COLOR_MAP[id]
                canvas.rect(chunkCanvasPoint, size, color)
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
    const relativePoint = Point.multiplyScalar(worldPoint, chunkRect.width)
    const offsetChunkPoint = Point.minus(relativePoint, [offset, offset])
    const noiseRect = Rect.multiply(rect, chunkRect.width)
    const surfaceGrid = Grid.fromRect(chunkRect, chunkPoint => {
        const noisePoint = Point.plus(offsetChunkPoint, chunkPoint)
        return getType(context, noiseRect, noisePoint)
    })
    // Detect borders on base grid
    const marginGrid = Grid.fromRect(chunkRect, chunkPoint => {
        const surface = surfaceGrid.get(chunkPoint)
        for (let sidePoint of Point.adjacents(chunkPoint)) {
            let sideSurface = surfaceGrid.get(sidePoint)
            // get negative indices to offset noisePoint
            // sample noise outside chunkRect
            if (! chunkRect.isInside(sidePoint)) {
                const noisePoint = Point.plus(offsetChunkPoint, chunkPoint)
                const [sideX, sideY] = sidePoint
                const x = sideX < 0 ? - 1 : (sideX >= chunkSize ? 1 : 0)
                const y = sideY < 0 ? - 1 : (sideY >= chunkSize ? 1 : 0)
                const outerNoisePoint = Point.plus(noisePoint, [x, y])
                sideSurface = getType(context, noiseRect, outerNoisePoint)
            }
            if (surface == LAND && sideSurface == WATER)
                return LAND_BORDER
            if (surface == WATER && sideSurface == LAND)
                return WATER_BORDER
        }
        return surface
    })
    return marginGrid
}

function getType(context, noiseRect, noisePoint) {
    const { world } = context
    const noise = world.noise.get4DChunkOutline(noiseRect, noisePoint)
    return noise > SURFACE_NOISE_RATIO ? LAND : WATER
}
