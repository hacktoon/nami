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

    _erodeMatrix(width, height, landformMatrix) {
        const erosionQueue = []
        const calcErosion = centerPoint => {
            let centerLandform = landformMatrix.get(centerPoint)
            const sameLandforms = centerPoint.adjacents((sidePoint, _) => {
                const sideLandform = landformMatrix.get(sidePoint)
                if (Landform.canErode(centerLandform, sideLandform)) {
                    centerLandform = Landform.erode(centerLandform, sideLandform)
                    erosionQueue.push(sidePoint)
                }
                if (centerPoint.hash === '58,52') {
                    console.log(sideLandform.name);
                }
                return centerLandform.name == sideLandform.name
            })
            // raise regions by neighborhood
            if (sameLandforms.length == 4) {
                centerLandform = Landform.rise(centerLandform)
            }
            return centerLandform
        }
        const matrix = new Matrix(width, height, calcErosion)
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