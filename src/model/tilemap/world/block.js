import { Point } from '/src/lib/point'
import { Rect } from '/src/lib/number'
import { Random } from '/src/lib/random'
import { Matrix } from '/src/lib/matrix'


export class BlockMap {
    #matrix

    constructor(layers, seed, rect, point) {
        this.layers = layers
        this.point = point
        this.rect = rect
        this.seed = this.#buildSeed(point, seed)
        // seed is fixed for current block point
        this.#matrix = this.#buildMatrix(rect)
    }

    get size() {
        return this.rect.width
    }

    #buildSeed(point, baseSeed="") {
        // create a seed like '1567456731+5,7'
        const seed = `${baseSeed}+${Point.hash(point)}`
        Random.seed = seed
        return seed
    }

    #buildMatrix(rect) {
        const isBlockWater = this.layers.surface.isWater(this.point)
        return Matrix.fromRect(rect, point => {
            if (isBlockWater) {
                return Random.choice(0, 0, 0, 0, 0, 0, 1)
            }
            return Random.choice(0, 1, 2)
        })
    }

    get(point) {
        return this.#matrix.get(point)
    }
}