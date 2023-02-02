import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'

import { Relief } from './data'


const TRENCH_RATIO = .35
const OCEAN_RATIO = .47
const PLAIN_RATIO = .4
const PLATEAU_RATIO = .55
const MOUNTAIN_RATIO = .5


export class ReliefLayer {
    #noiseLayer
    #surfaceLayer
    #borders = new PointSet()
    #matrix

    constructor(rect, layers) {
        this.#noiseLayer = layers.noise
        this.#surfaceLayer = layers.surface
        this.#matrix = Matrix.fromRect(rect, point => {
            this.#detectBorders(point)
            return this.#detectType(point)
        })
    }

    #detectType(point) {
        const outlineNoise = this.#noiseLayer.getOutline(point)
        const featureNoise = this.#noiseLayer.getFeature(point)
        const grainedNoise = this.#noiseLayer.getGrained(point)
        const isWater = this.#surfaceLayer.isWater(point)
        const isDepression = this.#surfaceLayer.isDepression(point)

        // water -----------------------------------
        if (isWater) {
            if (outlineNoise < OCEAN_RATIO) {
                if (grainedNoise < TRENCH_RATIO)
                    return Relief.TRENCH.id
                return Relief.OCEAN.id
            }
            return Relief.SEA.id
        }

        // land -----------------------------------
        if (isDepression) return Relief.BASIN.id
        if (featureNoise > PLAIN_RATIO) {
            if (featureNoise > PLATEAU_RATIO) {
                if (grainedNoise > MOUNTAIN_RATIO)
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

    get landBorders() {
        const points = []
        this.#borders.forEach(point => {
            if (this.#surfaceLayer.isLand(point))
                points.push(point)
        })
        return points
    }

    get landReliefs() {
        return [
            Relief.BASIN,
            Relief.PLAIN,
            Relief.PLATEAU,
            Relief.MOUNTAIN,
        ]
    }

    get(point) {
        const id = this.#matrix.get(point)
        return Relief.fromId(id)
    }

    getText(point) {
        const relief = this.get(point)
        return `Relief(${relief.name})`
    }

    isMountain(point) {
        const id = this.#matrix.get(point)
        return id === Relief.MOUNTAIN.id
    }

    isSea(point) {
        const id = this.#matrix.get(point)
        return id === Relief.SEA.id
    }

    isTrench(point) {
        const id = this.#matrix.get(point)
        return id === Relief.TRENCH.id
    }

    isBorder(point) {
        return this.#borders.has(point)
    }
}
