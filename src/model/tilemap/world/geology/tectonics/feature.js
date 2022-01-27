import { Matrix } from '/lib/matrix'
import { SimplexNoise } from '/lib/fractal/noise'
import { Feature } from './table'

const NO_FEATURE = null


export class FeatureModel {
    #matrix
    #tectonicsTable
    #plateModel

    constructor(regionTileMap, tectonicsTable, plateModel, provinceModel) {
        this.#tectonicsTable = tectonicsTable
        this.#plateModel = plateModel
        const detail = 4
        const resolution = 0.7
        const scale = 0.05
        const noise = new SimplexNoise(detail, resolution, scale)
        this.#matrix = Matrix.fromRect(regionTileMap.rect, point => {
            if (provinceModel.hasFeature(point)) {
                const province = provinceModel.getProvince(point)
                return province.feature
            }
            const region = regionTileMap.getRegion(point)
            if (plateModel.isOceanic(region)) {
                return Feature.OCEANIC_PLAIN
            }
            return Feature.PLAIN
        })
    }

    get(point) {
        const feature = this.#matrix.get(point)
        return this.#tectonicsTable.getFeature(feature)
    }
}
