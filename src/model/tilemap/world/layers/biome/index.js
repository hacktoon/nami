import { Climate } from '../climate/data'
import { Rain } from '../rain/data'
import { Relief } from '../relief/data'
import { RiverStretch } from '../river/data'
import { Biome } from './data'


const CORAL_CORAL_NOISE = .6
const ICECAP_NOISE = .4


export class BiomeLayer {
    constructor(rect, layers) {
        this.layers = layers
    }

    #buildLandBiome(point) {
        const {rain, climate} = this.layers
        const layers = this.layers

        if (climate.is(point, Climate.FROZEN)) {
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

    #buildWaterBiome(point) {
        const layers = this.layers
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
        const isWater = this.layers.surface.isWater(point)
        let biome = isWater
            ? this.#buildWaterBiome(point)
            : this.#buildLandBiome(point)
        return Biome.get(biome.id)
    }

    getColor(point) {
        return this.get(point).color
    }

    is(point, type) {
        const biome = this.get(point)
        return biome.id === type.id
    }

    getText(point) {
        const biome = this.get(point)
        return `Biome(${biome.name})`
    }
}
