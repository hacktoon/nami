import { Point } from '/src/lib/point'
import { Rect } from '/src/lib/number'
import { Matrix } from '/src/lib/matrix'
import { SimplexNoise } from '/src/lib/noise'
import {
    Surface,
    LandSurface,
    WaterSurface,
} from './data'


export class SurfaceChunk {
    #matrix

    constructor(point, {world, chunkSize}) {
        const noiseLayer = world.layers.noise
        const isLand = world.layers.surface.isLand(point)
        const notBorder = ! world.layers.surface.isBorder(point)
        const rect = Rect.multiply(world.rect, chunkSize)
        const baseChunkPoint = Point.multiplyScalar(point, chunkSize)
        const noisex = new SimplexNoise()
        this.#matrix = new Matrix(chunkSize, chunkSize, (indexPoint) => {
            const point = Point.plus(baseChunkPoint, indexPoint)
            const noise = noiseLayer.get4D(rect, point, 'outline')
            if (noise > .6) {
                // remove islands on open water
                if (! isLand && notBorder) {
                    return WaterSurface.id
                }
                return LandSurface.id
            }
            // remove inner lakes on continents
            if (isLand && notBorder) {
                return LandSurface.id
            }
            return WaterSurface.id
        })
        this.size = chunkSize
    }

    get(point) {
        const surfaceId = this.#matrix.get(point)
        return Surface.parse(surfaceId)
    }
}