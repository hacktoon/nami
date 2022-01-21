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
    #provinceIdList = []
    #borderPointSet = new PointSet()
    #provinceMap = new Map()
    #provinceMaxLevelMap = new Map()

    constructor(regionTileMap, plateModel) {
        const {width, height} = regionTileMap
        const boundaryModel = new BoundaryModel(regionTileMap, plateModel)

        this.#levelMatrix = new Matrix(width, height)
        this.#provinceMatrix = this._buildProvinceMatrix(
            regionTileMap, boundaryModel,
        )
        this.#deformationMatrix = this._buildDeformationMatrix(
            regionTileMap, boundaryModel,
        )
    }

    _buildProvinceMatrix(regionTileMap, boundaryModel) {
        const {width, height} = regionTileMap
        const originPoints = []
        // builds the province matrix while reading the region border points
        // used as fill origins, mapping the array index to its boundary types

        const matrix = new Matrix(width, height, point => {
            const borderRegions = regionTileMap.getBorderRegions(point)
            if (borderRegions.length > 0) {  // is a border point?
                const region = regionTileMap.getRegion(point)
                const sideRegion = borderRegions[0]
                const province = boundaryModel.getProvince(region, sideRegion)
                this.#provinceMap.set(province.id, province)
                // these are like maps and use the index as key
                this.#provinceIdList.push(province.id)
                this.#provinceMaxLevelMap.set(province.id, 0)
                originPoints.push(point)
            }
            return EMPTY
        })
        const mapFill = new ProvinceConcurrentFill(originPoints, matrix, this)
        mapFill.fill()
        return matrix
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

    // TODO: remove these fill methods, move to builder
    _setFillValue(matrix, index, point, level) {
        const id = this.#provinceIdList[index]
        matrix.set(point, id)
        this.#levelMatrix.set(point, level)
        // updates max level to use on % of deformation calc
        if (level > this.#provinceMaxLevelMap.get(id)) {
            this.#provinceMaxLevelMap.set(id, level)
        }
    }

    _setProvinceBorder(point) {
        this.#borderPointSet.add(point)
    }

    _isFillEmpty(matrix, point) {
        return matrix.get(point) === EMPTY
    }
}


class ProvinceConcurrentFill extends ConcurrentFill {
    constructor(origins, matrix, model) {
        super(origins, ProvinceFloodFill, {matrix, model})
    }
    getChance(id, origin) { return .5 }
    getGrowth(id, origin) { return 2 }
}


class ProvinceFloodFill extends ConcurrentFillUnit {
    setValue(index, point, level) {
        const matrix = this._getContext('matrix')
        const model = this._getContext('model')
        model._setFillValue(matrix, index, point, level)
    }

    isEmpty(point) {
        const matrix = this._getContext('matrix')
        const model = this._getContext('model')
        return model._isFillEmpty(matrix, point)
    }

    checkNeighbor(index, sidePoint, centerPoint) {
        if (this.isEmpty(sidePoint)) return
        const matrix = this._getContext('matrix')
        const model = this._getContext('model')
        const provinceId = matrix.get(centerPoint)
        const sideProvinceId = matrix.get(sidePoint)
        if (provinceId !== sideProvinceId) {
            model._setProvinceBorder(centerPoint)
        }
    }

    getNeighbors(originPoint) {
        return Point.adjacents(originPoint)
    }
}
