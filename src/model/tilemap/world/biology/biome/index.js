import { Matrix } from '/src/lib/matrix'

import { BIOME_SPEC } from './data'


export class BiomeLayer {
    #matrix

    constructor(rect, layers) {
        this.#matrix = Matrix.fromRect(rect, point => {
            return this.#detectBiome(layers, point)
        })
    }

    #detectBiome(layers, point) {
        const relief = layers.relief.get(point)

        // if (water) {
        //     const isWater = relief.isAbyss || relief.isShallow || relief.isBanks
        //     if (heat.isArctic && isWater) return ICE
        //     if (water.isSwamp) return SWAMP
        //     if (water.isLake || water.isSea || water.isPond) return LAKE
        //     if ((heat.isTropical || heat.isSubtropical) && relief.isBanks) {
        //         return CORAL_REEF
        //     }
        //     if (water.isRiver) return RIVER
        //     return OCEAN
        // }

        // if (heat.isArctic) {
        //     if (moisture.isHighest || moisture.isWet) return ICE
        //     return TUNDRA
        // }

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
    }

    get(point) {
        return this.#matrix.get(point)
    }
}
