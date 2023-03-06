import { Matrix } from '/src/lib/matrix'

import { Relief } from './data'


const TRENCH_RATIO = .65
const OCEAN_RATIO = .47
const PLATFORM_RATIO = .47
const BASIN_RATIO = .6
const BASIN_FEAT_RATIO = .3
const PLAIN_RATIO = .4
const PLATEAU_RATIO = .55
const MOUNTAIN_RATIO = .55


export class ReliefLayer {
    // Relief is related to large geologic features
    #noiseLayer
    #surfaceLayer
    #matrix
    #waterArea = 0

    constructor(rect, layers) {
        this.#noiseLayer = layers.noise
        this.#surfaceLayer = layers.surface
        this.#matrix = Matrix.fromRect(rect, point => {
            const isWater = this.#surfaceLayer.isWater(point)
            return this.#detectType(point, isWater)
        })
    }

    #detectType(point, isWater) {
        const outlineNoise = this.#noiseLayer.getOutline(point)
        const featureNoise = this.#noiseLayer.getFeature(point)
        const grainedNoise = this.#noiseLayer.getGrained(point)

        // water -----------------------------------
        if (isWater) {
            this.#waterArea++
            if (outlineNoise > PLATFORM_RATIO) return Relief.PLATFORM.id
            if (featureNoise > OCEAN_RATIO) return Relief.OCEAN.id
            if (grainedNoise > TRENCH_RATIO) return Relief.TRENCH.id
            return Relief.ABYSS.id
        }

        // land -----------------------------------
        if (outlineNoise < BASIN_RATIO || featureNoise < BASIN_FEAT_RATIO) {
            return Relief.BASIN.id
        }
        if (grainedNoise > MOUNTAIN_RATIO) { return Relief.MOUNTAIN.id }
        if (featureNoise > PLATEAU_RATIO) return Relief.PLATEAU.id
        if (outlineNoise > PLAIN_RATIO) return Relief.PLAIN.id
        return Relief.BASIN.id
    }

    getWaterArea() {
        const area = (this.#waterArea * 100) / this.#matrix.area
        return area.toFixed(1)
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
}
