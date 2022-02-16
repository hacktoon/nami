import { Matrix } from '/src/lib/matrix'
import { SimplexNoise } from '/src/lib/fractal/noise'
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
        const resolution = 0.5
        const scale = 0.1
        const noise = new SimplexNoise(detail, resolution, scale)
        this.#matrix = Matrix.fromRect(regionTileMap.rect, point => {
            const province = provinceModel.getProvince(point)
            const isBorder = provinceModel.isProvinceBorder(point)
            const feature = province.feature
            if (provinceModel.hasFeature(point)) {
                //&& noise.get(point) > 100
                return feature
            }
            const region = regionTileMap.getRegion(point)
            const isSubmerged = this.#tectonicsTable.isWaterFeature(feature)
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
