import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { PairMap } from '/src/lib/map'
import { PointSet } from '/src/lib/point/set'

import { TerrainConcurrentFill } from './fill'
import { LAND_LAYERS, WATER_LAYERS, Terrain } from '../data'


const EMPTY = null


export class TerrainLayer {
    #landBorders = new PointSet()
    #waterBorders = new PointSet()
    #basinMap = new PairMap()
    #flowMap = new PairMap()
    #surfaceLayer
    #noiseLayer
    #matrix

    constructor(noiseLayer, surfaceLayer) {
        this.#surfaceLayer = surfaceLayer
        this.#noiseLayer = noiseLayer
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
            waterBorders: this.#waterBorders,
            landBorders: this.#landBorders,
            basinMap: this.#basinMap,
            flowMap: this.#flowMap,
            matrix: matrix,
        }
        // new TerrainConcurrentFill(this.#landBorders.points, context).fill()
        return matrix
    }

    #detectBorders(point) {
        for (let sidePoint of Point.adjacents(point)) {
            const sideSurface = this.#surfaceLayer.get(sidePoint)
            if (this.#surfaceLayer.isWater(point)) {
                if (! sideSurface.water) {
                    this.#waterBorders.add(point)
                    break
                }
            } else {
                if (sideSurface.water) {
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
