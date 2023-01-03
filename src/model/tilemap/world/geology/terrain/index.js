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
            if (outlineNoise < Terrain.OCEAN.ratio) {
                if (grainedNoise < Terrain.ABYSS.ratio)
                    return Terrain.ABYSS.id
                return Terrain.OCEAN.id
            }
            return Terrain.SEA.id
        }

        // land -----------------------------------
        if (isBorder) return Terrain.BASIN.id
        if (isDepression) return Terrain.BASIN.id
        if (featureNoise > Terrain.PLAIN.ratio) {
            if (featureNoise > Terrain.PLATEAU.ratio) {
                if (grainedNoise > Terrain.MOUNTAIN.ratio)
                    return Terrain.MOUNTAIN.id
                return Terrain.PLATEAU.id
            }
            return Terrain.PLAIN.id
        }
        return Terrain.BASIN.id
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
