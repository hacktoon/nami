import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'

import { LAYERS, BASE_RATIO, BASE_NOISE } from '../data'
import { LAKE } from '../data'


const EMPTY = null


export class TerrainLayer {
    #matrix
    #geotypeLayer
    #landBorders

    constructor(noiseMapSet, geotypeLayer) {
        const noiseMap = noiseMapSet.get(BASE_NOISE)
        this.#landBorders = new PointSet()
        // todo: use PairMap
        this.#geotypeLayer = geotypeLayer
        const matrix = Matrix.fromRect(noiseMap.rect, point => {
            this.#detectShorePoints(point)
            return EMPTY
        })
    }

    #detectShorePoints(point) {
        if (this.#geotypeLayer.isWater(point))
            return
        for (let sidePoint of Point.adjacents(point)) {
            const geotype = this.#geotypeLayer.get(sidePoint)
            if (geotype.water) {
                this.#landBorders.add(point)
                break
            }
        }
    }

    isLandBorder(point) {
        return this.#landBorders.has(point)
    }
}
