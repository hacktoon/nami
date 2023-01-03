import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'

import { Terrain } from './data'


const EMPTY = null


export class TerrainLayer {
    #noiseLayer
    #surfaceLayer
    #borders = new PointSet()
    #matrix

    constructor(rect, noiseLayer, surfaceLayer) {
        this.#noiseLayer = noiseLayer
        this.#surfaceLayer = surfaceLayer
        this.#matrix = Matrix.fromRect(rect, point => {
            const isBorder = this.#detectBorders(point)
            return this.#detectType(point, isBorder)
        })
    }

    #detectType(point, isBorder) {
        const outlineNoise = this.#noiseLayer.get('outline', point)
        const featureNoise = this.#noiseLayer.get('feature', point)
        const grainedNoise = this.#noiseLayer.get('grained', point)
        const isWater = this.#surfaceLayer.isWater(point)
        const isDepression = this.#surfaceLayer.isDepression(point)

        // water -----------------------------------
        if (isWater) {
            if (outlineNoise < 0.47) {
                if (grainedNoise < 0.35) {
                    return Terrain.ABYSS
                }
                return Terrain.OCEAN
            }
            return Terrain.SEA
        }

        // land -----------------------------------
        if (isBorder) {
            return Terrain.BASIN
        }
        if (featureNoise > 0.45) {
            if (featureNoise > 0.6) {
                if (grainedNoise > 0.5) {
                    return Terrain.MOUNTAIN
                }
                return Terrain.PLATEAU
            }
            return Terrain.PLAIN
        }
        // if (isDepression) {
        //     return Terrain.OCEAN
        // }
        return Terrain.BASIN
    }

    #detectBorders(point) {
        const isWater = this.#surfaceLayer.isWater(point)
        for (let sidePoint of Point.adjacents(point)) {
            const isSideWater = this.#surfaceLayer.isWater(sidePoint)
            if (isWater && ! isSideWater || ! isWater && isSideWater) {
                this.#borders.add(point)
                return true
            }
        }
        return false
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
