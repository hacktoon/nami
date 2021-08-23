import { Matrix } from '/lib/base/matrix'
import { LANDFORMS, Landform } from './landform'


const EMPTY = null

// TODO: get border as a landform value in landform matrix calc

export class ErosionModel {
    constructor(reGroupTileMap, plateModel) {
        const {width, height} = reGroupTileMap

        this.plateModel = plateModel
        this.landformMatrix = new Matrix(width, height, point => {
            return plateModel.getLandformByPoint(point)
        })
        this.erosionMatrix = new ErosionMatrix(width, height, this.landformMatrix)
    }

    get(point) {
        return this.landformMatrix.get(point)
    }

    getErodedLandform(point) {
        return this.erosionMatrix.get(point)
    }

}


class ErosionMatrix {
    constructor(width, height, landformMatrix) {
        let [matrix, queue] = this._erodeMatrix(width, height, landformMatrix)
        // queue = this._erodeQueue(matrix, queue)
        // queue = this._erodeQueue(matrix, queue)
        // queue = this._erodeQueue(matrix, queue)

        this.matrix = matrix
    }

    _erodeMatrix(width, height, baseMatrix) {
        const erosionQueue = []
        const buildMatrix = centerPoint => {
            const neighbors = centerPoint.adjacents()
            const sideLandforms = neighbors.map(pt => baseMatrix.get(pt))
            let centerLandform = baseMatrix.get(centerPoint)
            let sameNeighborCount = 0

            for(let sideLandform of sideLandforms) {
                if (Landform.canErode(centerLandform, sideLandform)) {
                    centerLandform = Landform.erode(centerLandform, sideLandform)
                    // erosionQueue.push(sidePoint) //ta add + 2 vezes
                }
                if (centerLandform.name == sideLandform.name)
                    sameNeighborCount++
            }
            // raise regions by neighborhood
            if (sameNeighborCount == 4) {
                centerLandform = Landform.rise(centerLandform)
            }
            return centerLandform
        }
        const matrix = new Matrix(width, height, buildMatrix)
        // console.log(`${erosionQueue.length} points eroded`)
        return [matrix, erosionQueue]
    }

    _erodeQueue(matrix, queue) {
        const erosionQueue = []
        queue.forEach(centerPoint => {
            let centerLandform = matrix.get(centerPoint)
            centerPoint.adjacents((sidePoint, direction) => {
                const sideLandform = matrix.get(sidePoint)
                // erode region by neighborhood
                if (Landform.canErode(centerLandform, sideLandform)) {
                    centerLandform = Landform.erode(centerLandform, sideLandform)
                    erosionQueue.push(sidePoint)
                }
                return centerLandform.name == sideLandform.name
            })
        })
        erosionQueue.forEach(point => {
            // matrix.set(point, centerLandform)
        })
        console.log(erosionQueue.length, ' points eroded');
        return erosionQueue
    }

    get(point) {
        return this.matrix.get(point)
    }
}