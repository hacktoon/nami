import { Point } from '/src/lib/point'
import { Random } from '/src/lib/random'
import { Rect } from '/src/lib/number'
import { Matrix } from '/src/lib/matrix'


const BLOCK_SIZE = 9


export class BlockMap {
    #world
    #layers
    #surfaceMatrix
    #rect = new Rect(BLOCK_SIZE, BLOCK_SIZE)

    constructor(world, worldPoint) {
        this.#world = world
        this.#layers = world.layers
        this.worldPoint = worldPoint
        this.#surfaceMatrix = this.#buildSurface(worldPoint)
        // seed is fixed for current block point
    }

    get size() {
        return this.#rect.width
    }

    #buildSurface(worldPoint) {
        const noiseLayer = this.#layers.noise
        const isWaterBlock = this.#layers.surface.isWater(worldPoint)
        const isBorderBlock = this.#layers.surface.isBorder(worldPoint)
        const noiseRect = new Rect(
            this.#world.rect.width * this.#rect.width,
            this.#world.rect.height * this.#rect.height,
        )
        const baseNoisePoint = [worldPoint[0] * BLOCK_SIZE, worldPoint[1] * BLOCK_SIZE]
        return Matrix.fromRect(this.#rect, point => {
            // map point at world noise map to a point in block
            const noisePoint = Point.plus(baseNoisePoint, point)

            const noise = noiseLayer.get4D(noiseRect, noisePoint, 'outline')
            // if (isWaterBlock) {
            //     return noise > .70
            //         ? (noise > .80 ? 3 : 0)
            //         : 0
            // }
            // const isEdge = this.#rect.inEdge(point)
            // if (isBorderBlock) {
            //     return noise > .45 ? 1 : 0
            // }
            // return noise > .25 ? 1 : 2
            return noise
        })
    }

    get(point) {
        return this.#surfaceMatrix.get(point)
    }
}