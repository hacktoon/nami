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
        const landMod = .05
        const waterMod = .2
        const noiseLayer = this.#layers.noise
        const isLandBlock = this.#layers.surface.isLand(worldPoint)
        const isBorderBlock = this.#layers.surface.isBorder(worldPoint)
        const noiseRect = new Rect(
            this.#world.rect.width * this.#resolution,
            this.#world.rect.height * this.#resolution,
        )
        // scale coordinate to block grid
        const baseNoisePoint = [
            worldPoint[0] * this.#resolution,
            worldPoint[1] * this.#resolution
        ]
        return Matrix.fromSize(this.#resolution, point => {
            // map point at world noise map to a point in block
            const noisePoint = Point.plus(baseNoisePoint, point)
            const outlineNoise = noiseLayer.get4D(noiseRect, noisePoint, 'outline')
            const blockNoise = noiseLayer.get4D(noiseRect, noisePoint, 'block')
            if (isLandBlock) {
                if (isBorderBlock)
                    return outlineNoise
                return clamp(outlineNoise, .61, 1)
            }
            // if (isBorderBlock)
            //     return blockNoise - waterMod
            // const isEdge = this.#rect.inEdge(point)
            // return noise > .25 ? 1 : 2
            return outlineNoise
        })
    }

    get(point) {
        return this.#surfaceMatrix.get(point)
    }
}