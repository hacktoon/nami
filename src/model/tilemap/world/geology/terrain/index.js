import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'

import { Terrain, LAND_LAYERS, BASE_NOISE } from '../data'


const EMPTY = null


export class TerrainLayer {
    #geotypeLayer
    #landBorders
    #waterBorders
    #matrix

    constructor(rect, noiseMapSet, geotypeLayer) {
        this.#landBorders = new PointSet()
        this.#waterBorders = new PointSet()
        this.#geotypeLayer = geotypeLayer
        this.#matrix = Matrix.fromRect(rect, point => {
            const isBorder = this.#detectBorder(point)
            let noiseMap = noiseMapSet.get(BASE_NOISE)
            LAND_LAYERS.forEach(point => {

            })
            return EMPTY
        })
    }

    #detectBorder(point) {
        for (let sidePoint of Point.adjacents(point)) {
            const sideGeotype = this.#geotypeLayer.get(sidePoint)
            if (this.#geotypeLayer.isWater(point)) {
                if (! sideGeotype.water) {
                    this.#waterBorders.add(point)
                    return true
                }
            } else {
                if (sideGeotype.water) {
                    this.#landBorders.add(point)
                    return true
                }
            }
        }
        return false
    }

    isLandBorder(point) {
        return this.#landBorders.has(point)
    }

    isWaterBorder(point) {
        return this.#waterBorders.has(point)
    }
}
