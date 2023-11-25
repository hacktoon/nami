import { Point } from '/src/lib/point'
import { Rect } from '/src/lib/number'
import { Matrix } from '/src/lib/matrix'
import {
    Surface,
    LandSurface,
    WaterSurface,
} from './data'


export class SurfaceChunk {
    #matrix

    constructor(point, {world, chunkSize}) {
        const noiseLayer = world.layers.noise
        const rect = Rect.multiply(world.rect, chunkSize)
        const baseChunkPoint = Point.multiplyScalar(point, chunkSize)
        this.#matrix = Matrix.fromSize(chunkSize, indexPoint => {
            const point = Point.plus(baseChunkPoint, indexPoint)
            const noise = noiseLayer.get4D(rect, point, 'outline')
            return noise > .6 ? LandSurface.id : WaterSurface.id
        })
        this.size = chunkSize
    }

    get(point) {
        const surfaceId = this.#matrix.get(point)
        return Surface.parse(surfaceId)
    }
}