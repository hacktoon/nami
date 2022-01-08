import { ConcurrentFill, ConcurrentFillUnit } from '/lib/floodfill/concurrent'
import { Point } from '/lib/point'
import { Matrix } from '/lib/matrix'


const EMPTY = 0


export class DeformationModel {
    #regionTileMap
    #boundaryMap

    constructor(regionTileMap, boundaryModel) {
        const {width, height} = regionTileMap
        const origins = []
        this.#regionTileMap = regionTileMap
        this.#boundaryMap = boundaryModel
        this.deformMatrix = new Matrix(width, height, point => {
            const regionBorders = regionTileMap.getBorderRegions(point)
            // is a border point?
            if (regionBorders.length > 0) {
                const region = regionTileMap.getRegion(point)
                const sideRegion = regionBorders[0]
                const boundary = boundaryModel.get(region, sideRegion)
                origins.push(point)
                return boundary.id
            }
            return EMPTY
        })
        const mapFill = new DeformationMultiFill(origins, this)
    }

    _buildDeformationMatrix(regionTileMap) {

        return
    }

}


class DeformationMultiFill extends ConcurrentFill {
    constructor(origins, model) {
        super(origins, model, DeformationFloodFill)
    }
    getChance(id, origin) { return .5 }
    getGrowth(id, origin) { return 4 }
}


class DeformationFloodFill extends ConcurrentFillUnit {
    setValue(id, point, level) {
        this.model.deformMatrix.set(point, id)
    }

    isEmpty(point) {
        return this.model.deformMatrix.get(point) === EMPTY
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
