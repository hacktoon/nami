import { Point } from '/src/lib/math/point'
import { PointSet } from '/src/lib/math/point/set'
import { Rect } from '/src/lib/math/rect'
import { Grid } from '/src/lib/grid'

import { buildLevelGrid } from './level'


export const WATER = 1
export const LAND = 2
export const LAND_BORDER = 3
export const WATER_BORDER = 4


export function buildModel(context) {
    const model = {}
    model.type = buildTypeGrid(context)
    model.level = buildLevelGrid(model, context)
    return model
}

const LAND_NOISE = .55

function buildTypeGrid(context) {
    // Generate a boolean grid (land or water)
    const { worldPoint, world, rect, chunkRect, chunkSize } = context
    // Offset noise sampled at (0, 0) position in world map
    // It should have been sampled at chunk's midpoint. Solve this by offseting here.
    const offset = Math.floor(chunkSize / 2)
    const relativePoint = Point.multiplyScalar(worldPoint, chunkRect.width)
    const offsetChunkPoint = Point.minus(relativePoint, [offset, offset])
    const noiseRect = Rect.multiply(rect, chunkSize)
    // this only differentiates land / water
    const baseSurfaceGrid = Grid.fromRect(chunkRect, chunkPoint => {
        const noisePoint = Point.plus(offsetChunkPoint, chunkPoint)
        return getType(context, noiseRect, noisePoint)
    })
    // Detect borders on base grid
    return Grid.fromRect(chunkRect, chunkPoint => {
        const surface = baseSurfaceGrid.get(chunkPoint)
        for (let sidePoint of Point.adjacents(chunkPoint)) {
            // default value from base grid, transform it based on neighbors
            let sideSurface = baseSurfaceGrid.get(sidePoint)
            // get negative indices to offset noisePoint
            // sample noise outside chunkRect
            const [sideX, sideY] = sidePoint
            const x = sideX < 0 ? - 1 : (sideX >= chunkSize ? 1 : 0)
            const y = sideY < 0 ? - 1 : (sideY >= chunkSize ? 1 : 0)
            if (!chunkRect.isInside(sidePoint)) {
                const noisePoint = Point.plus(offsetChunkPoint, chunkPoint)
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
}

function getType(context, noiseRect, noisePoint) {
    const { world, chunkSize } = context
    const noise = world.noise.get4DChunkOutline(noiseRect, noisePoint)
    const offsetPoint = Point.plus(noisePoint, [chunkSize, chunkSize])
    return noise > LAND_NOISE ? LAND : WATER
}

