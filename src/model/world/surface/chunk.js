import { Point } from '/src/lib/geometry/point'
import { Rect } from '/src/lib/geometry/rect'
import { Grid } from '/src/lib/grid'


const DEEPWATER_NOISE_RATIO = .35
const LAND_NOISE_RATIO = .55
const HIGHLAND_NOISE_RATIO = .7
const DEPRESSION_NOISE_RATIO = .8
const PEAKLAND_NOISE_RATIO = .3
const DEEPWATER = 1
const WATER = 2
const LAND = 3
const HIGHLAND = 4
const PEAKLAND = 5
const LAND_BORDER = 6
const WATER_BORDER = 7

const COLOR_MAP = {
    [LAND]: '#71b13e',
    [HIGHLAND]: '#a4cc6b',
    [PEAKLAND]: '#d5ddca',
    [WATER]: '#282d68',
    [DEEPWATER]: '#181c46',
    [LAND_BORDER]: '#57894b',
    [WATER_BORDER]: '#2c3062',
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
    // this only differentiates land / water
    const baseSurfaceGrid = Grid.fromRect(chunkRect, chunkPoint => {
        const noisePoint = Point.plus(offsetChunkPoint, chunkPoint)
        return getType(context, noiseRect, noisePoint)
    })
    // Detect borders on base grid
    const marginGrid = Grid.fromRect(chunkRect, chunkPoint => {
        const surface = baseSurfaceGrid.get(chunkPoint)
        for (let sidePoint of Point.adjacents(chunkPoint)) {
            let sideSurface = baseSurfaceGrid.get(sidePoint)
            // get negative indices to offset noisePoint
            // sample noise outside chunkRect
            const [sideX, sideY] = sidePoint
            const x = sideX < 0 ? - 1 : (sideX >= chunkSize ? 1 : 0)
            const y = sideY < 0 ? - 1 : (sideY >= chunkSize ? 1 : 0)
            const noisePoint = Point.plus(offsetChunkPoint, chunkPoint)
            const outerNoisePoint = Point.plus(noisePoint, [x, y])
            if (! chunkRect.isInside(sidePoint)) {
                sideSurface = getType(context, noiseRect, outerNoisePoint)
            }
            if (surface == LAND && sideSurface == WATER) {
                return LAND_BORDER
            }
            if (surface == WATER && sideSurface == LAND)
                return WATER_BORDER
        }
        return surface
    })
    return marginGrid
}

function getType(context, noiseRect, noisePoint) {
    const { world } = context
    const dirtNoisePoint = noisePoint
    const noise = world.noise.get4DChunkOutline(noiseRect, dirtNoisePoint)
    const grainedNoise = world.noise.get4DChunkGrained(noiseRect, dirtNoisePoint)
    if (noise > LAND_NOISE_RATIO) {
        // highland
        if (noise > DEPRESSION_NOISE_RATIO && noise > HIGHLAND_NOISE_RATIO) {
            return grainedNoise > PEAKLAND_NOISE_RATIO ? HIGHLAND : PEAKLAND
        }
        if (grainedNoise < PEAKLAND_NOISE_RATIO) {
            return HIGHLAND
        }
        return LAND
    } else {
        return noise < DEEPWATER_NOISE_RATIO ? DEEPWATER : WATER
    }
}
