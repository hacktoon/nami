import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'
import { PointSet } from '/src/lib/point/set'

import { Relief } from './data'


const TRENCH_RATIO = .65
const OCEAN_RATIO = .47
const PLATFORM_RATIO = .47
const BASIN_RATIO = .6
const BASIN_FEAT_RATIO = .3
const PLAIN_RATIO = .4
const PLATEAU_RATIO = .55
const MOUNTAIN_RATIO = .55
const PEAK_RATIO = .75


export class ReliefLayer {
    // Relief is related to large geologic features
    #borders = new PointSet()
    #noiseLayer
    #surfaceLayer
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
            if (outlineNoise > PLATFORM_RATIO) return Relief.PLATFORM.id
            if (featureNoise > OCEAN_RATIO) return Relief.OCEAN.id
            if (grainedNoise > TRENCH_RATIO) return Relief.TRENCH.id
            return Relief.ABYSS.id
        }

        // land -----------------------------------
        if (isDepression) return Relief.BASIN.id
        if (outlineNoise < BASIN_RATIO || featureNoise < BASIN_FEAT_RATIO) {
            // basins on borders and in large intra basins
            return Relief.BASIN.id
        }
        if (grainedNoise > MOUNTAIN_RATIO) {
            if (grainedNoise > PEAK_RATIO) return Relief.PEAK.id
            return Relief.MOUNTAIN.id
        }
        if (featureNoise > PLATEAU_RATIO) return Relief.PLATEAU.id
        if (outlineNoise > PLAIN_RATIO) return Relief.PLAIN.id
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
            Relief.PEAK,
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

    isPlatform(point) {
        const id = this.#matrix.get(point)
        return id === Relief.PLATFORM.id
    }

    isTrench(point) {
        const id = this.#matrix.get(point)
        return id === Relief.TRENCH.id
    }

    isBorder(point) {
        return this.#borders.has(point)
    }
}
