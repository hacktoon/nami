import { Matrix } from '/lib/matrix'
import { Point } from '/lib/point'
import { Landform } from './landform'


const EMPTY = null


export class ErosionModel {
    constructor(model) {
        const {width, height} = model
        this.landformMatrix = new Matrix(width, height, point => {
            return model.tectonicsModel.getLandformByPoint(point)
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
        this.visited = null
    }

    _buildMatrix(landformMatrix) {
        const {width, height} = landformMatrix
        const matrix = new Matrix(width, height, point => {
            this.erosionQueue.push(point)
            return landformMatrix.get(point)
        })
        this.visited = new Matrix(width, height, () => EMPTY)
        while(this.erosionQueue.length > 0) {
            this.erosionQueue = this._erodeQueue(matrix)
        }
        return matrix
    }

    _erodeQueue(matrix) {
        const erosionQueue = []
        for(let erodePoint of this.erosionQueue) {
            // for each point in queue, visit the adjacents
            const points = this._erodeQueueAdjacents(matrix, erodePoint)
            erosionQueue.push(...points)
        }
        return erosionQueue
    }

    _erodeQueueAdjacents(matrix, erodePoint) {
        const erosionQueue = []
        for(let point of Point.adjacents(erodePoint)) {
            const sidePoints = Point.adjacents(point)
            let landform = matrix.get(point)
            let highestSideLandform = landform
            // visit each side point landform
            for(let sidePoint of sidePoints) {
                const sideLandform = matrix.get(sidePoint)
                // get the highest landform of sides
                if (sideLandform.height > highestSideLandform.height) {
                    highestSideLandform = sideLandform
                }
            }
            // erode center based on highest side
            if (Landform.canErode(landform, highestSideLandform)) {
                landform = Landform.erode(landform, highestSideLandform)
                if (! this.visited.get(point))
                    erosionQueue.push(point)
            }
            this.visited.set(point, true)
            matrix.set(point, landform)
        }
        return erosionQueue
    }

    get(point) {
        return this.matrix.get(point)
    }
}


class BasinMatrix {
    constructor(erosionMatrix) {
        const {width, height} = erosionMatrix
        this.shorePoints = []
        this.matrix = new Matrix(width, height, point => {
            this.shorePoints.push(point)
            return erosionMatrix.get(point)
        })
    }

    get(point) {
        return this.matrix.get(point)
    }
}
