import { ConcurrentFill, ConcurrentFillUnit } from '/lib/floodfill/concurrent'
import { Point } from '/lib/point'
import { PairMap } from '/lib/map'
import { Matrix } from '/lib/matrix'


const EMPTY = 0


export class ProvinceModel {
    #provinceMatrix

    constructor(regionTileMap, boundaryModel) {
        const {width, height} = regionTileMap
        const origins = []
        this.boundaries = []
        // build the province matrix while reading the region border points
        // used as fill origins, mapping the array index to its boundary types
        this.#provinceMatrix = new Matrix(width, height, point => {
            const regionBorders = regionTileMap.getBorderRegions(point)
            if (regionBorders.length > 0) {  // is a border point?
                const region = regionTileMap.getRegion(point)
                const boundary = boundaryModel.get(region, regionBorders[0])
                this.boundaries.push(boundary)
                origins.push(point)
            }
            return EMPTY
        })
        const mapFill = new ProvinceConcurrentFill(origins, this)
        mapFill.fill()
    }

    setProvince(point, id) {
        this.#provinceMatrix.set(point, id)
    }

    getProvinces() {
        return this.boundaries
    }

    getProvince(point) {
        return this.#provinceMatrix.get(point)
    }

    getProvinceName(point) {
        const id = this.#provinceMatrix.get(point)
        return this.boundaries[id].name
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
    setValue(id, point, level) {
        this.model.setProvince(point, id)
    }

    isEmpty(point) {
        return this.model.getProvince(point) === EMPTY
    }

    checkNeighbor(id, sidePoint, centerPoint) {
    }

    getNeighbors(originPoint) {
        return Point.adjacents(originPoint)
    }
}
