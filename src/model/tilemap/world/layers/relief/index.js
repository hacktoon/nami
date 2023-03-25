import { Matrix } from '/src/lib/matrix'

import { Relief } from './data'


const TRENCH_RATIO = .65
const OCEAN_RATIO = .47
const PLATFORM_RATIO = .47
const HILL_RATIO = .5
const PLATEAU_RATIO = .4
const MOUNTAIN_RATIO = .4


export class ReliefLayer {
    // Relief is related to large geologic features
    #matrix

    constructor(rect, layers) {
        this.#matrix = Matrix.fromRect(rect, point => {
            const isWater = layers.surface.isWater(point)
            const type = isWater ? this.#detectWaterType(layers, point)
                                 : this.#detectLandType(layers, point)
            return type.id
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
        const isRiverSource = (
            layers.river.has(point) && layers.basin.isDivide(point)
        )
        if (isRiverSource) {
            if (featureNoise > MOUNTAIN_RATIO) return Relief.MOUNTAIN
            return Relief.PLATEAU
        } else {
            // define other river points on the basin
            const isHeadWaters = layers.river.isHeadWaters(point)
            const isFastCourse = layers.river.isFastCourse(point)
            if (isFastCourse || isHeadWaters) return Relief.HILL
            // lower points of rivers
            const isSlowCourse = layers.river.isSlowCourse(point)
            // all depositional rives parts are plains
            const isDepositional = layers.river.isDepositional(point)
            if (isDepositional || isSlowCourse) return Relief.PLAIN
        }
        // not on a river, try adding more plateaus or hills
        if (grainedNoise < PLATEAU_RATIO) return Relief.PLATEAU
        if (grainedNoise < HILL_RATIO) return Relief.HILL
        return Relief.PLAIN
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

    isPlain(point) {
        const id = this.#matrix.get(point)
        return id === Relief.PLAIN.id
    }
}
