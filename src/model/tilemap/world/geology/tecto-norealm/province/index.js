import { ConcurrentFill, ConcurrentFillUnit } from '/lib/floodfill/concurrent'
import { Point } from '/lib/point'
import { Matrix } from '/lib/matrix'


const EMPTY = null


// TODO: rename to TileMapLayer, extract builder (model) from layer
// layer has getters only
export class ProvinceModel {
    #provinceMatrix
    #provincesByIndex = []
    #provinceMap = new Map()

    constructor(regionTileMap, boundaryModel) {
        const {width, height} = regionTileMap
        const originPoints = []
        // builds the province matrix while reading the region border points
        // used as fill origins, mapping the array index to its boundary types
        this.#provinceMatrix = new Matrix(width, height, point => {
            const regionBorders = regionTileMap.getBorderRegions(point)
            if (regionBorders.length > 0) {  // is a border point?
                const region = regionTileMap.getRegion(point)
                const province = boundaryModel.get(region, regionBorders[0])
                this.#provinceMap.set(province.id, province)
                // these are like maps and use the index as key
                this.#provincesByIndex.push(province.id)
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

    // TODO: remove this method, move to builder
    _setFillValue(point, index) {
        const id = this.#provincesByIndex[index]
        const province = this.#provinceMap.get(id)
        this.#provinceMatrix.set(point, province.id)
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
    getGrowth(id, origin) { return 4 }
}


class ProvinceFloodFill extends ConcurrentFillUnit {
    setValue(index, point, level) {
        this.model._setFillValue(point, index)
    }

    isEmpty(point) {
        return this.model._isFillEmpty(point)
    }

    checkNeighbor(index, sidePoint, centerPoint) {
    }

    getNeighbors(originPoint) {
        return Point.adjacents(originPoint)
    }
}
