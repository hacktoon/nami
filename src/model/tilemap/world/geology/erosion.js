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
        this.matrix = this._buildMatrix(width, height, landformMatrix)
        this.matrix = this._buildMatrix(width, height, this.matrix)
        this.matrix = this._buildMatrix(width, height, this.matrix)
        this.matrix = this._buildMatrix(width, height, this.matrix)
    }

    _buildMatrix(width, height, landformMatrix) {
        const erosionQueue = []
        const calcErosion = centerPoint => {
            let centerLandform = landformMatrix.get(centerPoint)
            const equalNeighbors = centerPoint.adjacents((sidePoint, direction) => {
                const sideLandform = landformMatrix.get(sidePoint)
                // erode region by neighborhood
                if (Landform.canErode(centerLandform, sideLandform)) {
                    erosionQueue.push(centerPoint)
                    centerLandform = Landform.erode(centerLandform, sideLandform)
                }
                return centerLandform.name == sideLandform.name
            })
            // raise regions by neighborhood
            if (equalNeighbors.length == 4) {
                centerLandform = Landform.rise(centerLandform)
            }
            return centerLandform
        }
        const matrix = new Matrix(width, height, calcErosion)
        // console.log(erosionQueue.length, ' points eroded');
        return matrix
    }

    get(point) {
        return this.matrix.get(point)
    }
}