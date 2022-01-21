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
        const originPoints = []
        // builds the province matrix while reading the region border points
        // used as fill origins, mapping the array index to its boundary types
        const boundaryModel = new BoundaryModel(regionTileMap, plateModel)
        this.#levelMatrix = new Matrix(width, height)
        this.#provinceMatrix = new Matrix(width, height, point => {
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
        this.#deformationMatrix = new Matrix(width, height)
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
    _setFillValue(index, point, level) {
        const id = this.#provinceIdList[index]
        this.#provinceMatrix.set(point, id)
        this.#levelMatrix.set(point, level)
        // updates max level to use on % of deformation calc
        if (level > this.#provinceMaxLevelMap.get(id)) {
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
        this.model._setFillValue(index, point, level)
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
