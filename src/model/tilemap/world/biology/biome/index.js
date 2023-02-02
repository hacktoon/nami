import { Matrix } from '/src/lib/matrix'
import { Random } from '/src/lib/random'

import { Biome } from './data'


export class BiomeLayer {
    #matrix

    constructor(rect, layers) {
        this.#matrix = Matrix.fromRect(rect, point => {
            const biome = this.#detectBiome(layers, point)
            return biome.id
        })
    }

    #detectBiome(layers, point) {
        const temperature = layers.temperature.get(point)
        // water biomes
        if (layers.surface.isWater(point)) {
            if (layers.relief.isTrench(point)) return Biome.TRENCH
            if (layers.relief.isSea(point)) return Biome.SEA
            return Biome.OCEAN
        }

        // land biomes
        if (temperature.isFrozen()) {

        }

        if (temperature.isCold()) {

        }

        if (temperature.isTemperate()) {

        }

        if (temperature.isWarm()) {

        }

        if (temperature.isHot()) {

        }

        // if (heat.isSubarctic) {
        //     if (moisture.isHighest || moisture.isWet) return BOREAL_FOREST
        //     return TUNDRA
        // }

        // if (heat.isTemperate) {
        //     if (moisture.isHighest || moisture.isWet) return TEMPERATE_FOREST
        //     if (moisture.isSeasonal) return WOODLANDS
        //     return GRASSLANDS
        // }

        // if (heat.isSubtropical) {
        //     if (relief.isRiverBank) return MANGROVE
        //     if (moisture.isHighest) return RAINFOREST
        //     if (moisture.isWet) return SAVANNA
        //     if (moisture.isSeasonal) return SHRUBLAND
        //     if (moisture.isDry) return SHRUBLAND
        //     if (moisture.isLowest) return DESERT
        // }

        // if (heat.isTropical) {
        //     if (relief.isRiverBank) return MANGROVE
        //     if (moisture.isHighest) return JUNGLE
        //     if (moisture.isWet) return RAINFOREST
        //     if (moisture.isSeasonal) return SAVANNA
        //     if (moisture.isDry) return SHRUBLAND
        //     if (moisture.isLowest) return DESERT
        // }
        return Biome.GRASSLANDS
    }

    get(point) {
        return this.#matrix.get(point)
    }
}
