import { Point } from '/src/lib/point'
import { Random } from '/src/lib/random'
import { Matrix } from '/src/lib/matrix'
import { SimplexNoise } from '/src/lib/noise'


export class BlockMap {
    #noise
    #surfaceMatrix

    constructor(worldSeed, rect, isWater, worldPoint) {
        this.#noise = new SimplexNoise(6, .8, .08)
        this.rect = rect
        this.worldPoint = worldPoint
        this.isWater = isWater
        this.#surfaceMatrix = this.#buildSurface(worldSeed, rect, worldPoint)
        // seed is fixed for current block point
    }

    get size() {
        return this.rect.width
    }

    #buildSurface(worldSeed, rect, worldPoint) {
        Random.seed = `${worldSeed}+${Point.hash(worldPoint)}`
        const offset = [0, 0]
        return Matrix.fromRect(rect, point => {
            const blockPoint = Point.plus(point, offset)
            if (this.isWater) {
                const noise = this.#buildNoise(rect, blockPoint)
                return noise > .95 ? 1 : 0
            }
            const noise = this.#buildNoise(rect, blockPoint)
            return noise > .5 ? 1 : 2
        })
    }

    #buildNoise(rect, point) {
        return this.#noise.wrappedNoise4D(rect, point)
    }

    get(point) {
        return this.#surfaceMatrix.get(point)
    }
}