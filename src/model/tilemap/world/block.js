import { Point } from '/src/lib/point'
import { Rect } from '/src/lib/number'
import { Random } from '/src/lib/random'
import { Matrix } from '/src/lib/matrix'


export class BlockMap {
    #matrix

    constructor(layers, seed, rect, point) {
        this.layers = layers
        this.seed = seed
        this.point = point
        this.#matrix = this.#buildMatrix(rect)
    }

    #buildMatrix(rect) {
        return Matrix.fromRect(rect, point => {

        })
    }

    get(point) {

    }
}