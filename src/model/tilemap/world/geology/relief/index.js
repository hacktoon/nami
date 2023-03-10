import { Matrix } from '/src/lib/matrix'

import { Relief } from './data'


const TRENCH_RATIO = .65
const OCEAN_RATIO = .47
const PLATFORM_RATIO = .47
const PLAIN_RATIO = .55
const PLATEAU_RATIO = .4
const MOUNTAIN_RATIO = .4


export class ReliefLayer {
    // Relief is related to large geologic features
    #matrix

    constructor(rect, layers) {
        this.#matrix = Matrix.fromRect(rect, point => {
            const isWater = layers.surface.isWater(point)
            const reliefType = isWater ? this.#detectWaterType(layers, point)
                                       : this.#detectLandType(layers, point)
            return reliefType.id
        })
    }

    #detectWaterType(layers, point) {
        // use noise to create water relief
        const outlineNoise = layers.noise.getOutline(point)
        const featureNoise = layers.noise.getFeature(point)
        const grainedNoise = layers.noise.getGrained(point)
        if (outlineNoise > PLATFORM_RATIO) return Relief.PLATFORM
        if (featureNoise > OCEAN_RATIO) return Relief.OCEAN
        if (grainedNoise > TRENCH_RATIO) return Relief.TRENCH
        return Relief.ABYSS
    }

    #detectLandType(layers, point) {
        const featureNoise = layers.noise.getFeature(point)
        const grainedNoise = layers.noise.getGrained(point)
        if (layers.river.isRiver(point)) {
            const river = layers.river.isRiver(point)
            if (layers.basin.isRiverSource(point)) {
                if (featureNoise > MOUNTAIN_RATIO) return Relief.MOUNTAIN
                if (grainedNoise > PLATEAU_RATIO) return Relief.PLATEAU
                return Relief.PLAIN
            }
        } else {
            // there's no river, add random plateaus and plains
            if (grainedNoise < PLATEAU_RATIO) return Relief.PLATEAU
            if (featureNoise > PLAIN_RATIO) return Relief.PLAIN
        }
        return Relief.BASIN
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
