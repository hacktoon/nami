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
    #matrix

    constructor(rect, layers) {
        this.#matrix = Matrix.fromRect(rect, point => {
            if (layers.surface.isWater(point)) {
                return this.#detectWaterType(layers, point)
            }
            return this.#detectLandType(layers, point)
        })
    }

    #detectWaterType(layers, point) {
        const outlineNoise = layers.noise.getOutline(point)
        const featureNoise = layers.noise.getFeature(point)
        const grainedNoise = layers.noise.getGrained(point)
        if (outlineNoise > PLATFORM_RATIO) return Relief.PLATFORM.id
        if (featureNoise > OCEAN_RATIO) return Relief.OCEAN.id
        if (grainedNoise > TRENCH_RATIO) return Relief.TRENCH.id
        return Relief.ABYSS.id
    }

    #detectLandType(layers, point) {
        const featureNoise = layers.noise.getFeature(point)


        return Relief.BASIN.id
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
