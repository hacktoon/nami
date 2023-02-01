import { Matrix } from '/src/lib/matrix'


export class BiomeLayer {
    #matrix

    constructor(rect, layers) {
        this.#matrix = Matrix.fromRect(rect, point => {
            return this.#detectBiome(layers, point)
        })
    }

    #detectBiome(layers, point) {

    }

    get(point) {
        return this.#matrix.get(point)
    }
}
