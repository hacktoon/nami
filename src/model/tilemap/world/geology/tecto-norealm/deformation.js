import { Matrix } from '/lib/matrix'
import { SimplexNoise } from '/lib/fractal/noise'

const NO_DEFORMATION = null


export class DeformationModel {
    #matrix

    constructor(regionTileMap, plateModel, provinceModel) {
        const detail = 4
        const resolution = 0.7
        const scale = 0.05
        const noise = new SimplexNoise(detail, resolution, scale)
        this.#matrix = Matrix.fromRect(regionTileMap.rect, point => {
            if (provinceModel.isDeformed(point)) {
                return 1
            }
            return NO_DEFORMATION
            // return noise.get(point) > 150 ? 1 : NO_DEFORMATION
        })
    }

    get(point) {
        return this.#matrix.get(point)
    }

    hasDeformation(point) {
        return this.#matrix.get(point) !== NO_DEFORMATION
    }
}
