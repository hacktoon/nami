import { Matrix } from '/lib/matrix'

const NO_DEFORMATION = null


export class DeformationModel {
    #matrix

    constructor(regionTileMap, plateModel, provinceModel) {
        this.#matrix = Matrix.fromRect(regionTileMap.rect, point => {
            if (provinceModel.isDeformed(point)) {
                return 1
            }
            return NO_DEFORMATION
        })
    }

    get(point) {
        return this.#matrix.get(point)
    }

    hasDeformation(point) {
        return this.#matrix.get(point) !== NO_DEFORMATION
    }
}
