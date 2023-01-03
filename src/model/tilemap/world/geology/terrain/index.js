import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'

import { Terrain } from './data'


const EMPTY = null


export class TerrainLayer {
    #surfaceLayer
    #borders = new PointSet()
    #matrix

    constructor(noiseLayer, surfaceLayer) {
        this.#surfaceLayer = surfaceLayer
        this.#matrix = Matrix.fromRect(noiseLayer.rect, point => {

            let terrain = EMPTY
            const isWater = surfaceLayer.isWater(point)
            this.#detectBorders(point)
            if (isWater) {
                return Terrain.OCEAN
            } else {
                return Terrain.PLAIN
            }
        })
    }

    #detectBorders(point) {
        const isWater = this.#surfaceLayer.isWater(point)
        for (let sidePoint of Point.adjacents(point)) {
            const isSideWater = this.#surfaceLayer.isWater(sidePoint)
            // TODO: refactor
            if (isWater) {
                if (! isSideWater) {
                    this.#borders.add(point)
                    break
                }
            } else if (isSideWater) {
                this.#borders.add(point)
                break
            }

        }
    }

    get(point) {
        const id = this.#matrix.get(point)
        return Terrain.fromId(id)
    }

    isLandBorder(point) {
        const isLand = this.#surfaceLayer.isLand(point)
        return this.#borders.has(point) && isLand
    }

    isWaterBorder(point) {
        const isWater = this.#surfaceLayer.isWater(point)
        return this.#borders.has(point) && isWater
    }

}
