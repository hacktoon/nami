import { Matrix } from '/src/lib/matrix'

import { Biome } from './data'


const CORAL_REEF_NOISE = .6
const ICECAP_NOISE = .6
const WASTELAND_NOISE = .4
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
        const rain = layers.rain.get(point)
        const grainedNoise = layers.noise.getGrained(point)
        const temperature = layers.temperature.get(point)

        if (temperature.isFrozen()) {
            if (rain.isDry() || rain.isArid() && grainedNoise > ICECAP_NOISE)
                return Biome.ICECAP
            return Biome.TUNDRA
        }

        if (temperature.isCold()) {
            if (rain.isHumid()) return Biome.TUNDRA
            if (rain.isArid()) return Biome.GRASSLANDS
            return Biome.TAIGA
        }

        if (temperature.isTemperate()) {
            if (rain.isHumid()) return Biome.TAIGA
            if (rain.isWet()) return Biome.WOODLANDS
            if (rain.isSeasonal()) return Biome.WOODLANDS
            if (rain.isDry() || rain.isArid()) return Biome.GRASSLANDS
        }

        if (temperature.isWarm()) {
            const isRiverMouth = layers.river.isMouth(point)
            if (isRiverMouth && grainedNoise > MANGROVE_NOISE) return Biome.MANGROVE
            if (rain.isHumid()) return Biome.JUNGLE
            if (rain.isWet()) return Biome.WOODLANDS
            if (rain.isSeasonal()) return Biome.GRASSLANDS
            if (rain.isDry()) return Biome.SAVANNA
            if (rain.isArid()) return Biome.DESERT
        }

        if (temperature.isHot()) {
            if (layers.river.isMouth(point)) return Biome.MANGROVE
            if (rain.isHumid() || rain.isWet()) return Biome.JUNGLE
            if (rain.isSeasonal()) return Biome.JUNGLE
            if (rain.isDry()) return Biome.SAVANNA
            if (rain.isArid()) {
                if (grainedNoise > WASTELAND_NOISE) return Biome.WASTELAND
                return Biome.DESERT
            }
        }
    }


    #buildWaterBiome(layers, point) {
        const grainedNoise = layers.noise.getGrained(point)
        const temperature = layers.temperature.get(point)
        if (temperature.isFrozen() && grainedNoise > ICECAP_NOISE) {
            return Biome.ICECAP
        }
        if (layers.relief.isTrench(point)) return Biome.TRENCH
        if (layers.relief.isSea(point)) {
            const isReefTemp = temperature.isWarm() || temperature.isHot()
            const isBorder = layers.relief.isBorder(point)
            const isOcean = layers.surface.isOcean(point)
            const isNoise = grainedNoise > CORAL_REEF_NOISE
            if (!isBorder && isReefTemp && isOcean && isNoise)
                return Biome.REEF
            return Biome.SEA
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
