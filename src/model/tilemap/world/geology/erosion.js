import { Matrix } from '/lib/base/matrix'
import { Point } from '/lib/base/point'
import { LANDFORMS } from './landform'


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
        const erosionQueue = []
        const calcErosion = centerPoint => {
            let centerLandform = landformMatrix.get(centerPoint)

            const equals = centerPoint.adjacents((sidePoint, direction) => {
                const sideLandform = landformMatrix.get(sidePoint)
                // erode region by neighborhood
                if (sideLandform.height > centerLandform.height + 1) {
                    const name = sideLandform.erodesTo
                    centerLandform = LANDFORMS[name] ?? centerLandform
                }
                // return those equal to center
                return centerLandform.name == sideLandform.name
            })

            // raise regions by neighborhood
            if (equals.length == 4) {
                const name = centerLandform.risesTo
                centerLandform = LANDFORMS[name] ?? centerLandform
            }
            return centerLandform
        }
        this.matrix = new Matrix(width, height, calcErosion)
    }

    get(point) {
        return this.matrix.get(point)
    }
}