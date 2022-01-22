import { ConcurrentFill, ConcurrentFillUnit } from '/lib/floodfill/concurrent'
import { Point } from '/lib/point'
import { PointSet } from '/lib/point/set'
import { Matrix } from '/lib/matrix'

import { BoundaryModel } from './boundary'

const NULL_PROVINCE = null
const NO_DEFORMATION = null


// TODO: rename to TileMapLayer, extract builder (model) from layer
// layer has getters only
export class ProvinceModel {
    #provinceMatrix
    #levelMatrix
    #deformationMatrix
    #borderPoints
    #maxLevelMap
    #provinceMap = new Map()

    constructor(regionTileMap, plateModel) {
        const boundaryModel = new BoundaryModel(regionTileMap, plateModel)
        const data = this._buildProvinces(regionTileMap, boundaryModel)
        const deformationMatrix = this._buildDeformationMatrix(regionTileMap, data)
        this.#provinceMatrix = data.provinceMatrix
        this.#levelMatrix = data.levelMatrix
        this.#borderPoints = data.borderPoints
        this.#maxLevelMap = data.maxLevelMap
        this.#deformationMatrix = deformationMatrix
    }

    _buildProvinces(regionTileMap, boundaryModel) {
        const {width, height} = regionTileMap
        const origins = []
        const provinceIdList = []
        const borderPoints = new PointSet()
        const maxLevelMap = new Map()
        const levelMatrix = new Matrix(width, height, point => 0)
        const provinceMatrix = new Matrix(width, height, point => {
            const borderRegions = regionTileMap.getBorderRegions(point)
            if (borderRegions.length > 0) {  // is a border point?
                const region = regionTileMap.getRegion(point)
                const sideRegion = borderRegions[0]
                const province = boundaryModel.getProvince(region, sideRegion)
                this.#provinceMap.set(province.id, province)
                maxLevelMap.set(province.id, 0)
                // these are like maps and use the index as key
                provinceIdList.push(province.id)
                origins.push(point)
            }
            return NULL_PROVINCE
        })
        const context = {
            provinceIdList, borderPoints, maxLevelMap,
            provinceMatrix, levelMatrix
        }
        new ProvinceConcurrentFill(origins, context).fill()
        return context
    }

    _buildDeformationMatrix(regionTileMap, data) {
        const provinceMatrix = data.provinceMatrix
        const {width, height} = provinceMatrix
        const levelMatrix = data.levelMatrix
        const borderPoints = data.borderPoints
        const maxLevelMap = data.maxLevelMap
        return new Matrix(width, height, point => {
            const provinceId = provinceMatrix.get(point)
            const province = this.#provinceMap.get(provinceId)
            const [minSpecLevel, maxSpecLevel] = province.deformation
            const level = levelMatrix.get(point)
            // const maxLevel = maxLevelMap.get(provinceId)
            const inRange = minSpecLevel <= level && level <= maxSpecLevel
            const isBorder = regionTileMap.isBorder(point)
            if (inRange && (! borderPoints.has(point) || isBorder)) {
                return provinceId
            }
            return NO_DEFORMATION
        })
    }

    getProvinces() {
        return Array.from(this.#provinceMap.keys())
    }

    getProvince(point) {
        const id = this.#provinceMatrix.get(point)
        return this.#provinceMap.get(id)
    }

    getProvinceName(point) {
        const province = this.getProvince(point)
        return province.name
    }

    getProvinceLevel(point) {
        return this.#levelMatrix.get(point)
    }

    getMaxLevel(provinceId) {
        return this.#maxLevelMap.get(provinceId)
    }

    isProvinceBorder(point) {
        return this.#borderPoints.has(point)
    }

    hasDeformation(point) {
        return this.#deformationMatrix.get(point) !== NO_DEFORMATION
    }
}


class ProvinceConcurrentFill extends ConcurrentFill {
    constructor(origins, context) {
        super(origins, ProvinceFloodFill, context)
    }
    getChance(id, origin) { return .5 }
    getGrowth(id, origin) { return 4 }
}


class ProvinceFloodFill extends ConcurrentFillUnit {
    setValue(fill, point, level) {
        const maxLevelMap = fill.context.maxLevelMap
        const id = fill.context.provinceIdList[fill.id]
        fill.context.provinceMatrix.set(point, id)
        fill.context.levelMatrix.set(point, level)
        // updates max level to use on % of deformation calc
        if (level > maxLevelMap.get(id)) {
            maxLevelMap.set(id, level)
        }
    }

    isEmpty(fill, point) {
        return fill.context.provinceMatrix.get(point) === NULL_PROVINCE
    }

    checkNeighbor(fill, sidePoint, centerPoint) {
        if (this.isEmpty(fill, sidePoint)) return
        const provinceMatrix = fill.context.provinceMatrix
        const provinceId = provinceMatrix.get(centerPoint)
        const sideProvinceId = provinceMatrix.get(sidePoint)
        if (provinceId !== sideProvinceId) {
            fill.context.borderPoints.add(provinceMatrix.wrap(centerPoint))
        }
    }

    getNeighbors(fill, originPoint) {
        return Point.adjacents(originPoint)
    }
}
