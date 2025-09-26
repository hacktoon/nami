import { Grid } from '/src/lib/grid'

import { Climate } from '../../climate/data'
import { Rain } from '../../rain/data'
import { Biome } from '../type'


export function buildModel(context) {
    // generate a grid with (land or water) information in bool
    const { chunk, rect, chunkRect } = context
    return Grid.fromRect(chunkRect, chunkPoint => {
        const isWater = ! chunk.surface.isLand(chunkPoint)
        const biomeType = isWater ? Biome.OCEAN : buildBiome(context, chunkPoint)
        // const biomeType = buildBiome(context, chunkPoint)
        return biomeType.id
    })
}


function buildBiome(context, point) {
    // Determine the biome based on climate and rain only
    const {chunk} = context
    const climate = chunk.climate.get(point)
    const rain = chunk.rain.get(point)

    if (climate.id == Climate.FROZEN.id) {
        return Biome.TUNDRA
    }

    if (climate.id == Climate.COLD.id) {
        if (rain.id == Rain.HUMID.id) return Biome.TUNDRA
        if (rain.id == Rain.WET.id) return Biome.TAIGA
        if (rain.id == Rain.SEASONAL.id) return Biome.TAIGA
        if (rain.id == Rain.DRY.id) return Biome.TAIGA
        if (rain.id == Rain.ARID.id) return Biome.WOODLANDS
    }

    if (climate.id == Climate.TEMPERATE.id) {
        if (rain.id == Rain.HUMID.id) return Biome.TAIGA
        if (rain.id == Rain.WET.id) return Biome.WOODLANDS
        if (rain.id == Rain.SEASONAL.id) return Biome.WOODLANDS
        if (rain.id == Rain.DRY.id) return Biome.GRASSLANDS
        return Biome.SAVANNA
    }

    if (climate.id == Climate.WARM.id) {
        if (rain.id == Rain.HUMID.id) return Biome.JUNGLE
        if (rain.id == Rain.WET.id) return Biome.JUNGLE
        if (rain.id == Rain.SEASONAL.id) return Biome.GRASSLANDS
        return Biome.SAVANNA
    }

    if (climate.id == Climate.HOT.id) {
        if (rain.id == Rain.HUMID.id) return Biome.JUNGLE
        if (rain.id == Rain.WET.id) return Biome.WOODLANDS
        if (rain.id == Rain.SEASONAL.id) return Biome.SAVANNA

    }
    return Biome.DESERT
}