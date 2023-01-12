import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'


export class HydroLayer {
    #reliefLayer
    #rainLayer
    #erosionLayer
    #rivers = new Map()
    #lakes = new Map()
    #riverPoints = new PointSet()

    constructor(rect, reliefLayer, rainLayer, erosionLayer) {
        this.#reliefLayer = reliefLayer
        this.#rainLayer = rainLayer
        this.#erosionLayer = erosionLayer
    }

    get(point) {

    }

    isRiver(point) {
        return this.#riverPoints.has(point)
    }
}
