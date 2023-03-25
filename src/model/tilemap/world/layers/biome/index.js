import { Matrix } from '/src/lib/matrix'

import { Climate } from '../../layers/climate/data'
import { Rain } from '../rain/data'
import { Biome } from './data'


const CORAL_REEF_NOISE = .6
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
        const rain = layers.rain.get(point)

        if (layers.climate.is(point, Climate.FROZEN)) {
            if (rain.is(Rain.ARID) && grainedNoise > ICECAP_NOISE)
                return Biome.ICECAP
            return Biome.TUNDRA
        }

        if (layers.climate.is(point, Climate.COLD)) {
            if (rain.is(Rain.HUMID)) return Biome.TUNDRA
            if (rain.is(Rain.ARID)) return Biome.GRASSLANDS
            return Biome.TAIGA
        }

        if (layers.climate.is(point, Climate.TEMPERATE)) {
            if (rain.is(Rain.HUMID)) return Biome.TAIGA
            if (rain.is(Rain.WET)) return Biome.WOODLANDS
            if (rain.is(Rain.SEASONAL)) return Biome.WOODLANDS
            if (rain.is(Rain.DRY)) return Biome.GRASSLANDS
            if (rain.is(Rain.ARID)) return Biome.SAVANNA
        }

        if (layers.climate.is(point, Climate.WARM)) {
            const isDepositional = layers.river.isDepositional(point)
            if (isDepositional) return Biome.MANGROVE
            if (rain.is(Rain.HUMID)) {
                if (layers.relief.isMountain(point)) return Biome.SAVANNA
                return Biome.JUNGLE
            }
            if (rain.is(Rain.WET)) return Biome.WOODLANDS
            if (rain.is(Rain.SEASONAL)) return Biome.GRASSLANDS
            if (rain.is(Rain.DRY)) return Biome.SAVANNA
        }

        if (layers.climate.is(point, Climate.HOT)) {
            const isDepositional = layers.river.isDepositional(point)
            const isSlowCourse = layers.river.isSlowCourse(point)
            const isJungle = rain.is(Rain.HUMID) || rain.is(Rain.WET)
            if (isDepositional || isSlowCourse) return Biome.MANGROVE
            if (isJungle) {
                if (layers.relief.isMountain(point)) return Biome.SAVANNA
                return Biome.JUNGLE
            }
            if (rain.is(Rain.SEASONAL)) return Biome.JUNGLE
            if (rain.is(Rain.DRY)) return Biome.SAVANNA
        }

        return Biome.DESERT
    }

    #buildWaterBiome(layers, point) {
        const grainedNoise = layers.noise.getGrained(point)
        if (layers.climate.is(point, Climate.FROZEN) && grainedNoise > ICECAP_NOISE) {
            return Biome.ICECAP
        }
        if (layers.relief.isTrench(point)) return Biome.TRENCH
        if (layers.relief.isPlatform(point)) {
            const isReefTemp = layers.climate.is(point, Climate.WARM)
                               || layers.climate.is(point, Climate.HOT)
            const isReefNoise = grainedNoise > CORAL_REEF_NOISE
            const isBorder = layers.surface.isBorder(point)
            if (!isBorder && isReefTemp && isReefNoise)
                return Biome.REEF
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
