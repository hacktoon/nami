import { Point } from '/src/lib/point'
import { Random } from '/src/lib/random'
import { Rect } from '/src/lib/number'
import { Matrix } from '/src/lib/matrix'


export class BlockMap {
    #world
    #resolution
    #layers
    #surfaceMatrix

    constructor(world, resolution, worldPoint) {
        this.#world = world
        this.#layers = world.layers
        this.#resolution = resolution  // int like 3x3, 9x9, etc
        this.#surfaceMatrix = this.#buildSurface(worldPoint)
        this.worldPoint = worldPoint
        // seed is fixed for current block point
    }

    get resolution() {
        return this.#resolution
    }

    #buildSurface(worldPoint) {
        const noiseLayer = this.#layers.noise
        const isWaterBlock = this.#layers.surface.isWater(worldPoint)
        const isBorderBlock = this.#layers.surface.isBorder(worldPoint)
        const noiseRect = new Rect(
            this.#world.rect.width * this.#resolution,
            this.#world.rect.height * this.#resolution,
        )
        const baseNoisePoint = [
            worldPoint[0] * this.#resolution,
            worldPoint[1] * this.#resolution
        ]
        return Matrix.fromSize(this.#resolution, point => {
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