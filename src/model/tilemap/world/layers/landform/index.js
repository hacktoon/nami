import { Matrix } from '/src/lib/matrix'

import { Landform } from './data'



export class LandformLayer {
    // Landform is related to world feature and block layout
    #matrix

    constructor(rect, layers) {
        this.#matrix = Matrix.fromRect(rect, point => {
            return
        })
    }

    get(point) {
        const id = this.#matrix.get(point)
        return Landform.fromId(id)
    }

    getText(point) {
        const landform = this.get(point)
        return `Landform(${landform.name})`
    }

}
