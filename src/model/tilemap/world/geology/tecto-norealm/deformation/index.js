import { ConcurrentFill, ConcurrentFillUnit } from '/lib/floodfill/concurrent'
import { Point } from '/lib/point'
import { Matrix } from '/lib/matrix'


export class DeformationModel {
    #regionTileMap
    #boundaryMap
    #deformMatrix

    constructor(regionTileMap, boundaryModel) {
        this.#regionTileMap = regionTileMap
        this.#boundaryMap = boundaryModel
        this.#deformMatrix = new Matrix(regionTileMap.width, regionTileMap.height)
        // const mapFill = new DeformationMultiFill(this, borderPoints)
    }

}


export class DeformationMultiFill extends ConcurrentFill {
    constructor(model, params) {
        super(model.origins, model, DeformationFloodFill)
        this.params = params
    }

    getChance(id, origin) {
        return .5
    }

    getGrowth(id, origin) {
        return 4
    }
}


class DeformationFloodFill extends ConcurrentFillUnit {
    setValue(id, point, level) {
        this.model.regionMatrix.set(point, id)
    }

    isEmpty(point) {
        return this.model.regionMatrix.get(point) === NO_REGION
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
