import { Matrix } from '/src/lib/matrix'
import { Random } from '/src/lib/random'

import { Biome } from './data'


export class BiomeLayer {
    #matrix

    constructor(rect, layers) {
        this.#matrix = Matrix.fromRect(rect, point => {
            const biome = this.#buildBiome(layers, point)
            return biome.id
        })
    }

    #buildBiome(layers, point) {
        const temperature = layers.temperature.get(point)
        const rain = layers.rain.get(point)
        const river = layers.river.get(point)

        // water biomes
        if (layers.surface.isWater(point)) {
            if (temperature.isFrozen()) {
                return Biome.ICE_PLAIN
            }
            if (layers.relief.isTrench(point)) return Biome.TRENCH
            if (layers.relief.isSea(point)) {
                // TODO: add coral reef
                return Biome.SEA
            }
            return Biome.OCEAN
        }

        // land biomes
        if (temperature.isFrozen()) {
            if (rain.isHumid()) return Biome.ICE_PLAIN
            if (rain.isWet()) return Biome.ICE_PLAIN
            if (rain.isSeasonal()) return Biome.TUNDRA
            if (rain.isDry()) return Biome.TUNDRA
            if (rain.isArid()) return Biome.TUNDRA
        }

        if (temperature.isCold()) {
            if (rain.isHumid()) return Biome.TUNDRA
            if (rain.isWet()) return Biome.TAIGA
            if (rain.isSeasonal()) return Biome.TAIGA
            if (rain.isDry()) return Biome.WOODLANDS
            if (rain.isArid()) return Biome.GRASSLANDS
        }

        if (temperature.isTemperate()) {
            if (rain.isHumid()) return Biome.TAIGA
            if (rain.isWet()) return Biome.WOODLANDS
            if (rain.isSeasonal()) return Biome.WOODLANDS
            if (rain.isDry()) return Biome.GRASSLANDS
            if (rain.isArid()) return Biome.GRASSLANDS
        }

        if (temperature.isWarm()) {
            if (rain.isHumid()) return Biome.JUNGLE
            if (rain.isWet()) return Biome.WOODLANDS
            if (rain.isSeasonal()) return Biome.GRASSLANDS
            if (rain.isDry()) return Biome.SAVANNA
            if (rain.isArid()) return Biome.DESERT
        }

        if (temperature.isHot()) {
            if (rain.isHumid()) return Biome.JUNGLE
            if (rain.isWet()) return Biome.JUNGLE
            if (rain.isSeasonal()) return Biome.SAVANNA
            if (rain.isDry()) return Biome.DESERT
            if (rain.isArid()) return Biome.WASTELAND
        }
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
