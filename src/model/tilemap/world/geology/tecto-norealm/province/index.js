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
    #borderPointSet = new PointSet()
    #provinceIdList = []
    #provinceMaxLevelMap = new Map()
    #provinceMap = new Map()

    constructor(regionTileMap, plateModel) {
        const {width, height} = regionTileMap
        const originPoints = []
        // builds the province matrix while reading the region border points
        // used as fill origins, mapping the array index to its boundary types
        const boundaryModel = new BoundaryModel(regionTileMap, plateModel)
        this.#levelMatrix = new Matrix(width, height)
        this.#provinceMatrix = new Matrix(width, height, point => {
            const borderRegions = regionTileMap.getBorderRegions(point)
            if (borderRegions.length > 0) {  // is a border point?
                const region = regionTileMap.getRegion(point)
                const province = boundaryModel.get(region, borderRegions[0])
                this.#provinceMap.set(province.id, province)
                // these are like maps and use the index as key
                this.#provinceIdList.push(province.id)
                this.#provinceMaxLevelMap.set(province.id, 0)
                originPoints.push(point)
            }
            return EMPTY
        })
        const mapFill = new ProvinceConcurrentFill(originPoints, this)
        mapFill.fill()
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
    _setFillValue(point, index) {
        const id = this.#provinceIdList[index]
        const province = this.#provinceMap.get(id)
        this.#provinceMatrix.set(point, province.id)
    }

    _setFillLevel(index, point, level) {
        const id = this.#provinceIdList[index]
        this.#levelMatrix.set(point, level)
        // update max level to use on % of deformation calc
        if (level >= this.#provinceMaxLevelMap.get(id)) {
            this.#provinceMaxLevelMap.set(id, level)
        }
    }

    _setProvinceBorder(point) {
        this.#borderPointSet.add(point)
    }

    _isFillEmpty(point) {
        return this.#provinceMatrix.get(point) === EMPTY
    }
}


class ProvinceConcurrentFill extends ConcurrentFill {
    constructor(origins, model) {
        super(origins, model, ProvinceFloodFill)
    }
    getChance(id, origin) { return .5 }
    getGrowth(id, origin) { return 2 }
}


class ProvinceFloodFill extends ConcurrentFillUnit {
    setValue(index, point, level) {
        this.model._setFillValue(point, index)
        this.model._setFillLevel(index, point, level)
    }

    isEmpty(point) {
        return this.model._isFillEmpty(point)
    }

    checkNeighbor(index, sidePoint, centerPoint) {
        if (this.isEmpty(sidePoint)) return
        const province = this.model.getProvince(centerPoint)
        const sideProvince = this.model.getProvince(sidePoint)
        if (province.id !== sideProvince.id) {
            this.model._setProvinceBorder(centerPoint)
        }
    }

    getNeighbors(originPoint) {
        return Point.adjacents(originPoint)
    }
}
