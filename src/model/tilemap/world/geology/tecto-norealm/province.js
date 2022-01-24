import { ConcurrentFill, ConcurrentFillUnit } from '/lib/floodfill/concurrent'
import { Point } from '/lib/point'
import { PointSet } from '/lib/point/set'
import { Matrix } from '/lib/matrix'

const NO_PROVINCE = null


export class ProvinceModel {
    #regionTileMap
    #provinceMatrix
    #levelMatrix
    #borderPoints
    #maxLevelMap
    #provinceMap = new Map()
    #boundaryIdMap = new Map()

    constructor(regionTileMap, plateModel, boundaryModel) {
        const data = this._buildProvinces(regionTileMap, plateModel, boundaryModel)
        this.#regionTileMap = regionTileMap
        this.#provinceMatrix = data.provinceMatrix
        this.#levelMatrix = data.levelMatrix
        this.#borderPoints = data.borderPoints
        this.#maxLevelMap = data.maxLevelMap
    }

    _buildProvinces(regionTileMap, plateModel, boundaryModel) {
        const origins = []
        const provinceIdList = []
        const borderPoints = new PointSet()
        const maxLevelMap = new Map()
        const levelMatrix = Matrix.fromRect(regionTileMap.rect, point => 0)
        // use matrix init to setup fill origin points
        // and discover the provinces used
        const provinceMatrix = Matrix.fromRect(regionTileMap.rect, point => {
            const borderRegions = regionTileMap.getBorderRegions(point)
            if (borderRegions.length > 0) {  // is a border point?
                const region = regionTileMap.getRegion(point)
                const sideRegion = borderRegions[0]
                const params = {boundaryModel, plateModel, region, sideRegion}
                const province = this._buildProvince(params)
                this.#provinceMap.set(province.id, province)
                maxLevelMap.set(province.id, 0)
                // these are like maps and use the index as key
                provinceIdList.push(province.id)
                origins.push(point)
            }
            return NO_PROVINCE
        })
        const context = {
            provinceIdList, borderPoints, maxLevelMap,
            provinceMatrix, levelMatrix
        }
        new ProvinceConcurrentFill(origins, context).fill()
        return context
    }

    _buildProvince({boundaryModel, plateModel, region, sideRegion}) {
        const plateWeight = plateModel.getWeight(region)
        const sidePlateWeight = plateModel.getWeight(sideRegion)
        const boundary = boundaryModel.get(region, sideRegion)
        const [heavier, lighter] = boundary.provinces
        return plateWeight > sidePlateWeight ? heavier : lighter
    }

    isDeformed(point) {
        const province = this.getProvince(point)
        const level = this.getProvinceLevel(point)
        const [minSpecLevel, maxSpecLevel] = province.features
        // const maxLevel = maxLevelMap.get(provinceId)
        const inRange = minSpecLevel <= level && level <= maxSpecLevel
        const isBorder = this.#regionTileMap.isBorder(point)
        return inRange && (! this.isProvinceBorder(point) || isBorder)
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
        // updates max level to use on % of feature calc
        if (level > maxLevelMap.get(id)) {
            maxLevelMap.set(id, level)
        }
    }

    isEmpty(fill, point) {
        return fill.context.provinceMatrix.get(point) === NO_PROVINCE
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
