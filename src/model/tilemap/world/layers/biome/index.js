import { Matrix } from '/src/lib/matrix'

import { Climate } from '../climate/data'
import { Rain } from '../rain/data'
import { Relief } from '../relief/data'
import { RiverStretch } from '../river/data'
import { Biome } from './data'


const CORAL_CORAL_NOISE = .6
const ICECAP_NOISE = .4


export class BiomeLayer {
    #matrix

    constructor(rect, layers) {
        this.#matrix = Matrix.fromRect(rect, point => {
            const biome = this.#buildBiome(layers, point)
            return biome.id
        })
    }

    #buildBiome(layers, point) {
        if (layers.surface.isWater(point)) {
            return this.#buildWaterBiome(layers, point)
        }
        return this.#buildLandBiome(layers, point)
    }

    #buildLandBiome(layers, point) {
        const grainedNoise = layers.noise.getGrained(point)
        const {rain, climate} = layers

        if (climate.is(point, Climate.FROZEN)) {
            if (rain.is(point, Rain.ARID) && grainedNoise > ICECAP_NOISE)
                return Biome.ICECAP
            return Biome.TUNDRA
        }

        if (climate.is(point, Climate.COLD)) {
            if (rain.is(point, Rain.HUMID)) return Biome.TUNDRA
            if (rain.is(point, Rain.ARID)) return Biome.GRASSLANDS
            return Biome.TAIGA
        }

        if (climate.is(point, Climate.TEMPERATE)) {
            if (rain.is(point, Rain.HUMID)) return Biome.TAIGA
            if (rain.is(point, Rain.WET)) return Biome.WOODLANDS
            if (rain.is(point, Rain.SEASONAL)) return Biome.WOODLANDS
            if (rain.is(point, Rain.DRY)) return Biome.GRASSLANDS
            if (rain.is(point, Rain.ARID)) return Biome.SAVANNA
        }

        if (climate.is(point, Climate.WARM)) {
            const isDepositional = layers.river.is(point, RiverStretch.DEPOSITIONAL)
            if (isDepositional) return Biome.MANGROVE
            if (rain.is(point, Rain.HUMID)) return Biome.JUNGLE
            if (rain.is(point, Rain.WET)) {
                return Biome.WOODLANDS
            }
            if (rain.is(point, Rain.SEASONAL)) return Biome.GRASSLANDS
            if (rain.is(point, Rain.DRY)) return Biome.SAVANNA
        }

        if (climate.is(point, Climate.HOT)) {
            const isDepositional = layers.river.is(point, RiverStretch.DEPOSITIONAL)
            const isSlowCourse = layers.river.is(point, RiverStretch.SLOW_COURSE)
            if (isDepositional || isSlowCourse) return Biome.MANGROVE
            const isJungle = rain.is(point, Rain.HUMID) || rain.is(point, Rain.WET)
            if (isJungle) return Biome.JUNGLE
            if (rain.is(point, Rain.SEASONAL)) return Biome.JUNGLE
            if (rain.is(point, Rain.DRY)) return Biome.SAVANNA
        }
        return Biome.DESERT
    }

    #buildWaterBiome(layers, point) {
        const grainedNoise = layers.noise.getGrained(point)
        const isFrozen = layers.climate.is(point, Climate.FROZEN)
        if (isFrozen && grainedNoise > ICECAP_NOISE) {
            return Biome.ICECAP
        }
        if (layers.relief.is(point, Relief.TRENCH)) return Biome.TRENCH
        if (layers.relief.is(point, Relief.PLATFORM)) {
            const isReefTemp = layers.climate.is(point, Climate.WARM)
                               || layers.climate.is(point, Climate.HOT)
            const isReefNoise = grainedNoise > CORAL_CORAL_NOISE
            const isBorder = layers.surface.isBorder(point)
            if (!isBorder && isReefTemp && isReefNoise)
                return Biome.CORAL
            return Biome.SEA
        }
        return Biome.OCEAN
    }

    get(point) {
        const id = this.#matrix.get(point)
        return Biome.get(id)
    }

    is(point, type) {
        const id = this.#matrix.get(point)
        return id === type.id
    }

    getText(point) {
        const biome = this.get(point)
        return `Biome(${biome.name})`
    }
}
