import { Matrix } from '/src/lib/matrix'

import { Temperature } from '../../climatology/temperature/data'
import { Rain } from '../../climatology/rain/data'
import { Biome } from './data'



const CORAL_REEF_NOISE = .6
const ICECAP_NOISE = .6
const MANGROVE_NOISE = .6


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
        const temperature = layers.temperature.get(point)

        if (temperature.is(Temperature.FROZEN)) {
            const isIcecap = grainedNoise > ICECAP_NOISE
            if (rain.is(Rain.DRY) || rain.is(Rain.ARID) && isIcecap)
                return Biome.ICECAP
            return Biome.TUNDRA
        }

        if (temperature.is(Temperature.COLD)) {
            if (rain.is(Rain.HUMID)) return Biome.TUNDRA
            if (rain.is(Rain.ARID)) return Biome.GRASSLANDS
            return Biome.TAIGA
        }

        if (temperature.is(Temperature.TEMPERATE)) {
            if (rain.is(Rain.HUMID)) return Biome.TAIGA
            if (rain.is(Rain.WET)) return Biome.WOODLANDS
            if (rain.is(Rain.SEASONAL)) return Biome.WOODLANDS
            if (rain.is(Rain.DRY)) return Biome.GRASSLANDS
            if (rain.is(Rain.ARID)) return Biome.SAVANNA
        }

        if (temperature.is(Temperature.WARM)) {
            const isRiverMouth = layers.hydro.isMouth(point)
            if (isRiverMouth && grainedNoise > MANGROVE_NOISE) return Biome.MANGROVE
            if (rain.is(Rain.HUMID)) return Biome.JUNGLE
            if (rain.is(Rain.WET)) return Biome.WOODLANDS
            if (rain.is(Rain.SEASONAL)) return Biome.GRASSLANDS
            if (rain.is(Rain.DRY)) return Biome.SAVANNA
        }

        if (temperature.is(Temperature.HOT)) {
            if (layers.hydro.isMouth(point)) return Biome.MANGROVE
            if (rain.is(Rain.HUMID) || rain.is(Rain.WET)) return Biome.JUNGLE
            if (rain.is(Rain.SEASONAL)) return Biome.JUNGLE
            if (rain.is(Rain.DRY)) return Biome.SAVANNA
        }

        return Biome.DESERT
    }

    #buildWaterBiome(layers, point) {
        const grainedNoise = layers.noise.getGrained(point)
        const temperature = layers.temperature.get(point)
        if (temperature.is(Temperature.FROZEN) && grainedNoise > ICECAP_NOISE) {
            return Biome.ICECAP
        }
        if (layers.relief.isTrench(point)) return Biome.TRENCH
        if (layers.relief.isPlatform(point)) {
            const isReefTemp = temperature.is(Temperature.WARM)
                               || temperature.is(Temperature.HOT)
            const isReefNoise = grainedNoise > CORAL_REEF_NOISE
            return isReefTemp && isReefNoise ? Biome.REEF : Biome.SEA
        }
        return Biome.OCEAN
    }

    get(point) {
        const id = this.#matrix.get(point)
        return Biome.fromId(id)
    }

    getText(point) {
        const biome = this.get(point)
        return `Biome(${biome.name})`
    }
}
