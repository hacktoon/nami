import { ConcurrentFill, ConcurrentFillUnit } from '/src/lib/floodfill/concurrent'
import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'


const NO_LEVEL = null
const MOUNTAIN = 1
const PLATEAU = 2
const PLAIN = 3
const SHALLOW_SEA = 4
const DEEP_SEA = 5

const FEATURES = {
    [MOUNTAIN]: {name: 'Mountain', water: false, color: '#AAA'},
    [PLATEAU]: {name: 'Hill', water: false, color: '#796'},
    [PLAIN]: {name: 'Plain', water: false, color: '#574'},
    [SHALLOW_SEA]: {name: 'Island', water: true, color: '#058'},
    [DEEP_SEA]: {name: 'Deep sea', water: true, color: '#036'},
}


export class ReliefModel {
    #reliefMatrix
    #shorePoints = new PointSet()

    constructor(rect, noiseTileMap, outlineModel) {
        this.#reliefMatrix = Matrix.fromRect(rect, point => {
            if (outlineModel.isWater(point)) return
            for(let sidePoint of Point.adjacents(point)) {
                if (outlineModel.isWater(sidePoint)) {
                    this.#shorePoints.add(point)
                    break
                }
            }
            return 1
        })
    }

    get(point) {
        return this.#reliefMatrix.get(point)
    }

    isShore(point) {
        return this.#shorePoints.has(point)
    }

}

