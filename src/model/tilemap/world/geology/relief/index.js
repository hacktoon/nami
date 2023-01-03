import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'

import { Relief } from './data'


export class ReliefLayer {
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
        const outlineNoise = this.#noiseLayer.getOutline(point)
        const featureNoise = this.#noiseLayer.getFeature(point)
        const grainedNoise = this.#noiseLayer.getGrained(point)
        const isWater = this.#surfaceLayer.isWater(point)
        const isDepression = this.#surfaceLayer.isDepression(point)

        // water -----------------------------------
        if (isWater) {
            if (outlineNoise < Relief.OCEAN.ratio) {
                if (grainedNoise < Relief.ABYSS.ratio)
                    return Relief.ABYSS.id
                return Relief.OCEAN.id
            }
            return Relief.SEA.id
        }

        // land -----------------------------------
        if (isBorder) return Relief.BASIN.id
        if (isDepression) return Relief.BASIN.id
        if (featureNoise > Relief.PLAIN.ratio) {
            if (featureNoise > Relief.PLATEAU.ratio) {
                if (grainedNoise > Relief.MOUNTAIN.ratio)
                    return Relief.MOUNTAIN.id
                return Relief.PLATEAU.id
            }
            return Relief.PLAIN.id
        }
        return Relief.BASIN.id
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
        return Relief.fromId(id)
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
