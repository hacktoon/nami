import { ConcurrentFill, ConcurrentFillUnit } from '/lib/floodfill/concurrent'
import { Point } from '/lib/point'
import { PointSet } from '/lib/point/set'
import { Matrix } from '/lib/matrix'

import { BoundaryModel } from './boundary'

const EMPTY = null


// TODO: rename to TileMapLayer, extract builder (model) from layer
// layer has getters only
export class ProvinceModel {
    #provinceMatrix
    #levelMatrix
    #deformationMatrix
    #borderPointSet
    #provinceMap = new Map()
    #provinceMaxLevelMap

    constructor(regionTileMap, plateModel) {
        const boundaryModel = new BoundaryModel(regionTileMap, plateModel)
        const data = this._buildData(regionTileMap, boundaryModel)
        this.#provinceMatrix = data.provinceMatrix
        this.#levelMatrix = data.levelMatrix
        this.#borderPointSet = data.borderPointSet
        this.#provinceMaxLevelMap = data.provinceMaxLevelMap
        this.#deformationMatrix = this._buildDeformationMatrix(
            regionTileMap, boundaryModel,
        )
    }

    _buildData(regionTileMap, boundaryModel) {
        const {width, height} = regionTileMap
        const originPoints = []
        const provinceIdList = []
        const borderPointSet = new PointSet()
        const provinceMaxLevelMap = new Map()
        const levelMatrix = new Matrix(width, height)
        const provinceMatrix = new Matrix(width, height, point => {
            const borderRegions = regionTileMap.getBorderRegions(point)
            if (borderRegions.length > 0) {  // is a border point?
                const region = regionTileMap.getRegion(point)
                const sideRegion = borderRegions[0]
                const province = boundaryModel.getProvince(region, sideRegion)
                this.#provinceMap.set(province.id, province)
                provinceMaxLevelMap.set(province.id, 0)
                // these are like maps and use the index as key
                provinceIdList.push(province.id)
                originPoints.push(point)
            }
            return EMPTY
        })
        const mapFill = new ProvinceConcurrentFill(originPoints, {
            provinceMatrix, levelMatrix, provinceIdList, borderPointSet,
            provinceMaxLevelMap
        })
        mapFill.fill()
        return {provinceMatrix, levelMatrix, borderPointSet, provinceMaxLevelMap}
    }

    _buildDeformationMatrix(regionTileMap, boundaryModel) {
        const {width, height} = regionTileMap
        return new Matrix(width, height)
    }

    getProvinces() {
        return Array.from(this.#provinceMap.keys())
    }

    getProvince(point) {
        const id = this.#provinceMatrix.get(point)
        return this.#provinceMap.get(id)
    }

    getProvinceName(point) {
        const id = this.#provinceMatrix.get(point)
        return this.#provinceMap.get(id).name
    }

    getProvinceLevel(point) {
        return this.#levelMatrix.get(point)
    }

    getMaxProvinceLevel(point) {
        const province = this.getProvince(point)
        return this.#provinceMaxLevelMap.get(province.id)
    }

    isProvinceBorder(point) {
        return this.#borderPointSet.has(point)
    }
}


class ProvinceConcurrentFill extends ConcurrentFill {
    constructor(origins, context) {
        super(origins, ProvinceFloodFill, context)
    }
    getChance(id, origin) { return .5 }
    getGrowth(id, origin) { return 1 }
}


class ProvinceFloodFill extends ConcurrentFillUnit {
    setValue(index, point, level) {
        const provinceMaxLevelMap = this._getContext('provinceMaxLevelMap')
        const id = this._getContext('provinceIdList')[index]
        this._getContext('provinceMatrix').set(point, id)
        this._getContext('levelMatrix').set(point, level)
        // updates max level to use on % of deformation calc
        if (level > provinceMaxLevelMap.get(id)) {
            provinceMaxLevelMap.set(id, level)
        }
    }

    isEmpty(point) {
        return this._getContext('provinceMatrix').get(point) === EMPTY
    }

    checkNeighbor(index, sidePoint, centerPoint) {
        if (this.isEmpty(sidePoint)) return
        const provinceMatrix = this._getContext('provinceMatrix')
        const provinceId = provinceMatrix.get(centerPoint)
        const sideProvinceId = provinceMatrix.get(sidePoint)
        if (provinceId !== sideProvinceId) {
            this._getContext('borderPointSet').add(centerPoint)
        }
    }

    getNeighbors(originPoint) {
        return Point.adjacents(originPoint)
    }
}
