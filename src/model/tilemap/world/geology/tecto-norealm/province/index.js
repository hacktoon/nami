import { ConcurrentFill, ConcurrentFillUnit } from '/lib/floodfill/concurrent'
import { Point } from '/lib/point'
import { PairMap } from '/lib/map'
import { Matrix } from '/lib/matrix'


const EMPTY = 0


export class ProvinceModel {
    #regionTileMap
    #boundaryModel
    #origins
    #pointMap
    #provinceMatrix

    constructor(regionTileMap, boundaryModel) {
        this.#origins = []
        this.#pointMap = new PairMap()
        this.#regionTileMap = regionTileMap
        this.#boundaryModel = boundaryModel
        this.#provinceMatrix = this._buildDeformationMatrix()
        const mapFill = new ProvinceConcurrentFill(this)
    }

    _buildDeformationMatrix() {
        const _buildTile = point => {
            const regionBorders = this.#regionTileMap.getBorderRegions(point)
            // is a border point?
            if (regionBorders.length > 0) {
                const region = this.#regionTileMap.getRegion(point)
                const sideRegion = regionBorders[0]
                const boundary = this.#boundaryModel.get(region, sideRegion)
                this.#origins.push(point)
                this.#pointMap.set(...point, boundary.id)
            }
            // all tiles initialize empty
            return EMPTY
        }
        const {width, height} = this.#regionTileMap
        return new Matrix(width, height, _buildTile)
    }

    get origins() {
        return this.#origins
    }

    get pointMap() {
        return this.#pointMap
    }

}


class ProvinceConcurrentFill extends ConcurrentFill {
    constructor(model) {
        super(model.origins, model, DeformationFloodFill)
    }
    getChance(id, origin) { return .5 }
    getGrowth(id, origin) { return 4 }
}


class DeformationFloodFill extends ConcurrentFillUnit {
    setValue(id, point, level) {
        this.model.provinceMatrix.set(point, id)
    }

    isEmpty(point) {
        return this.model.provinceMatrix.get(point) === EMPTY
    }

    checkNeighbor(id, neighborPoint, centerPoint) {
        if (this.isEmpty(neighborPoint)) return
        const neighborId = this.model.regionMatrix.get(neighborPoint)
        if (id === neighborId) return
        // mark region when neighbor point is filled by other region
        this.model.graph.setEdge(id, neighborId)
        this.model.borderMatrix.get(centerPoint).add(neighborId)
    }

    getNeighbors(originPoint) {
        return Point.adjacents(originPoint)
    }
}
