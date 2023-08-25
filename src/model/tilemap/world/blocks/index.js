import { Point } from '/src/lib/point'
import { Random } from '/src/lib/random'
import { Matrix } from '/src/lib/matrix'
import { SimplexNoise } from '/src/lib/noise'


export class BlockMap {
    #noise
    #matrix

    constructor(worldSeed, rect, isWater, worldPoint) {
        this.#noise = new SimplexNoise(6, .8, .08)
        this.rect = rect
        this.worldPoint = worldPoint
        this.isWater = isWater
        this.#matrix = this.#buildMatrix(worldSeed, rect, worldPoint)
        // seed is fixed for current block point
    }

    get size() {
        return this.rect.width
    }

    #buildMatrix(worldSeed, rect, worldPoint) {
        Random.seed = `${worldSeed}+${Point.hash(worldPoint)}`
        // get river line - after reworking rivers
        const offset = [0, 0]
        return Matrix.fromRect(rect, point => {
            const blockPoint = Point.plus(point, offset)
            if (this.isWater) {
                const noise = this.#buildNoise(rect, blockPoint)
                return noise > .8 ? 1 : 0
            }
            const noise = this.#buildNoise(rect, blockPoint)
            return noise > .3 ? 1 : 0
        })
    }

    #buildNoise(rect, point) {
        return this.#noise.wrappedNoise4D(rect, point)
    }

    get(point) {
        return this.#matrix.get(point)
    }
}