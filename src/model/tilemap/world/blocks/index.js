import { clamp } from '/src/lib/number'
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
        const isLandBlock = this.#layers.surface.isLand(worldPoint)
        const isBorderBlock = this.#layers.surface.isBorder(worldPoint)
        const blockRect = new Rect(
            this.#world.width * this.#resolution,
            this.#world.height * this.#resolution,
        )
        // scale coordinate to block grid
        const basePoint = Point.multiplyScalar(worldPoint, this.#resolution)
        return Matrix.fromSize(this.#resolution, point => {
            // map point at world noise map to a point in block
            const blockPoint = Point.plus(basePoint, point)
            const outlineNoise = noiseLayer.get4D(blockRect, blockPoint, 'outline')
            const blockNoise = noiseLayer.get4D(blockRect, blockPoint, 'block')
            // if (isLandBlock && outlineNoise >= .6) {
            //     if (outlineNoise > .6 && blockNoise > .6)
            //         return 2
            //     return 1
            // }
            if (isLandBlock) {
                if (isBorderBlock) {
                    if (outlineNoise > .6)
                        return 1
                    else
                        return 0
                }
                return 1
            }
            return 0
        })
    }

    get(point) {
        return this.#surfaceMatrix.get(point)
    }

    isWater(point) {
        return this.get(point) == 0
    }

    isMountain(point) {
        return this.get(point) == 2
    }
}