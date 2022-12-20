import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { PairMap } from '/src/lib/map'
import { Direction } from '/src/lib/direction'
import { PointSet } from '/src/lib/point/set'

import { Terrain } from './data'
import {
    LandTerrainConcurrentFill,
    WaterTerrainConcurrentFill
} from './fill'


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
            landBorders: this.#landBorders,
            waterBorders: this.#waterBorders,
            matrix: matrix,
            basinMap: this.#basinMap,
            flowMap: this.#flowMap,
        }
        new WaterTerrainConcurrentFill(context).fill()
        new LandTerrainConcurrentFill(context).fill()
        return matrix
    }

    #detectBorders(point) {
        const isWater = this.#surfaceLayer.isWater(point)
        for (let sidePoint of Point.adjacents(point)) {
            const isSideWater = this.#surfaceLayer.isWater(sidePoint)
            const isSideDepression = this.#surfaceLayer.isDepression(sidePoint)
            if (isWater) {
                if (! isSideWater) {
                    this.#waterBorders.add(point)
                    break
                }
            } else if (isSideWater) {
                this.#landBorders.add(point)
                break
            }
        }
    }

    get basinCount() {
        return this.#basinMap.size
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

    getBasin(point) {
        return this.#basinMap.get(...point)
    }

    getFlow(point) {
        const id = this.#flowMap.get(...point)
        return Direction.fromId(id)
    }
}
