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
        this.erosionMatrix = new Matrix(width, height, () => EMPTY)
        let baseMatrix = this._erodeMatrix(landformMatrix)
        baseMatrix = this._erodeMatrix(baseMatrix)
        baseMatrix = this._erodeMatrix(baseMatrix)
        baseMatrix = this._erodeMatrix(baseMatrix)

        this.matrix = baseMatrix
    }

    _erodeMatrix(baseMatrix) {
        const buildMatrix = point => {
            let landform = baseMatrix.get(point)
            let highestSideLandform = landform
            let sameNeighborCount = 0
            const sidePoints = point.adjacents()
            // visit each side point landform
            for(let sidePoint of sidePoints) {
                const sideLandform = baseMatrix.get(sidePoint)
                // get the highest landform of sides
                if (sideLandform.height > highestSideLandform.height) {
                    highestSideLandform = sideLandform
                }
                // is it the same landform?
                if (landform.name == sideLandform.name) {
                    sameNeighborCount++
                }
            }
            // erode center based on side
            if (Landform.canErode(landform, highestSideLandform)) {
                landform = Landform.erode(landform, highestSideLandform)
            } else if (sameNeighborCount == sidePoints.length) {
                landform = Landform.rise(landform)
            }
            return landform
        }
        return new Matrix(baseMatrix.width, baseMatrix.height, buildMatrix)
    }

    get(point) {
        return this.matrix.get(point)
    }
}