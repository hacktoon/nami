import { Matrix } from '/lib/base/matrix'
import { Landform } from './landform'


const EMPTY = null


export class ErosionModel {
    constructor(reGroupTileMap, plateModel) {
        const {width, height} = reGroupTileMap

        this.plateModel = plateModel
        this.landformMatrix = new Matrix(width, height, point => {
            return plateModel.getLandformByPoint(point)
        })
        this.erosionMatrix = new ErosionMatrix(this.landformMatrix)
    }

    get(point) {
        return this.landformMatrix.get(point)
    }

    getErodedLandform(point) {
        return this.erosionMatrix.get(point)
    }

}


class ErosionMatrix {
    constructor(landformMatrix) {
        this.erosionQueue = []
        this.matrix = this._buildMatrix(landformMatrix)
    }

    _buildMatrix(landformMatrix) {
        const {width, height} = landformMatrix
        const matrix = new Matrix(width, height, point => {
            this.erosionQueue.push(point)
            return landformMatrix.get(point)
        })
        while(this.erosionQueue.length > 0) {
            console.log(this.erosionQueue.length);
            this.erosionQueue = this._erodeQueue(matrix)
        }
        return matrix
    }

    _erodeQueue(matrix) {
        const erosionQueue = []
        for(let erodedPoint of this.erosionQueue) {
            for(let point of erodedPoint.adjacents()) {
                const sidePoints = point.adjacents()
                let landform = matrix.get(point)
                let highestSideLandform = landform
                let sameNeighborCount = 0
                // visit each side point landform
                for(let sidePoint of sidePoints) {
                    const sideLandform = matrix.get(sidePoint)
                    // get the highest landform of sides
                    if (sideLandform.height > highestSideLandform.height) {
                        highestSideLandform = sideLandform
                    }
                    // is it the same landform?
                    if (landform.name == sideLandform.name) {
                        sameNeighborCount++
                    }
                }
                // erode center based on highest side
                if (Landform.canErode(landform, highestSideLandform)) {
                    landform = Landform.erode(landform, highestSideLandform)
                    matrix.set(point, landform)
                    erosionQueue.push(point)
                } else if (sameNeighborCount === sidePoints.length) {
                    landform = Landform.rise(landform)
                    matrix.set(point, landform)
                }
            }
        }
        return erosionQueue
    }

    get(point) {
        return this.matrix.get(point)
    }
}