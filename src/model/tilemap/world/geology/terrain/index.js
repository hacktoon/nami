import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { PairMap } from '/src/lib/map'
import { PointSet } from '/src/lib/point/set'

import { Terrain } from './data'
import { TerrainConcurrentFill } from './fill'


const EMPTY = null


export class TerrainLayer {
    #landBorders = new PointSet()
    #waterBorders = new PointSet()
    #basinMap = new PairMap()
    #flowMap = new PairMap()
    #noiseLayer
    #surfaceLayer
    #matrix

    constructor(noiseLayer, surfaceLayer) {
        this.#noiseLayer = noiseLayer
        this.#surfaceLayer = surfaceLayer
        this.#matrix = this.#buildLayer(noiseLayer.rect)
    }

    #buildLayer(rect) {
        const matrix = Matrix.fromRect(rect, point => {
            this.#detectBorders(point)
            return EMPTY
        })
        const context = {
            noiseLayer: this.#noiseLayer,
            surfaceLayer: this.#surfaceLayer,
            matrix: matrix,
            landBorders: this.#landBorders,
            waterBorders: this.#waterBorders,
            basinMap: this.#basinMap,
            flowMap: this.#flowMap,
        }
        const landOrigins = this.#landBorders.points
        new TerrainConcurrentFill(landOrigins, context).fill()
        return matrix
    }

    #detectBorders(point) {
        const isWater = this.#surfaceLayer.isWater(point)
        for (let sidePoint of Point.adjacents(point)) {
            const isSideWater = this.#surfaceLayer.isWater(sidePoint)
            if (isWater) {
                if (! isSideWater) {
                    this.#waterBorders.add(point)
                    break
                }
            } else {
                if (isSideWater) {
                    this.#landBorders.add(point)
                    break
                }
            }
        }
    }

    get(point) {
        const id = this.#matrix.get(point)
        return Terrain.fromId(id)
    }

    isLandBorder(point) {
        return this.#landBorders.has(point)
    }

    isWaterBorder(point) {
        return this.#waterBorders.has(point)
    }
}
