import { Point } from '/src/lib/geometry/point'
import { Direction } from '/src/lib/direction'
import { Grid } from '/src/lib/grid'
import { Rect } from '/src/lib/geometry/rect'

import { Climate } from '../../world/climate/data'
import { Rain } from '../../world/rain/data'


export function buildBiomeGrid(context) {
    // generate a grid with (land or water) information in bool
    const {worldPoint, world, rect, zoneRect} = context
    const relativePoint = Point.multiplyScalar(worldPoint, zoneRect.width)
    const noiseRect = Rect.multiply(rect, zoneRect.width)
    return Grid.fromRect(zoneRect, zonePoint => {
        const noisePoint = Point.plus(relativePoint, zonePoint)
        const noise = world.noise.get4DZoneOutline(noiseRect, noisePoint)
        return noise > SURFACE_NOISE_RATIO
    })
}


function buildBiome(point) {
    // Determine the biome based on climate and rain only
    const {rain, climate} = this.world

    if (climate.is(point, Climate.FROZEN)) {
        return Biome.TUNDRA
    }

    if (climate.is(point, Climate.COLD)) {
        if (rain.is(point, Rain.HUMID)) return Biome.TUNDRA
        if (rain.is(point, Rain.WET)) return Biome.TAIGA
        if (rain.is(point, Rain.SEASONAL)) return Biome.TAIGA
        if (rain.is(point, Rain.DRY)) return Biome.TAIGA
        if (rain.is(point, Rain.ARID)) return Biome.WOODLANDS

    }

    if (climate.is(point, Climate.TEMPERATE)) {
        if (rain.is(point, Rain.HUMID)) return Biome.TAIGA
        if (rain.is(point, Rain.WET)) return Biome.WOODLANDS
        if (rain.is(point, Rain.SEASONAL)) return Biome.WOODLANDS
        if (rain.is(point, Rain.DRY)) return Biome.GRASSLANDS
        return Biome.SAVANNA
    }

    if (climate.is(point, Climate.WARM)) {
        if (rain.is(point, Rain.HUMID)) return Biome.JUNGLE
        if (rain.is(point, Rain.WET)) return Biome.JUNGLE
        if (rain.is(point, Rain.SEASONAL)) return Biome.GRASSLANDS
        return Biome.SAVANNA
    }

    if (climate.is(point, Climate.HOT)) {
        if (rain.is(point, Rain.HUMID)) return Biome.JUNGLE
        if (rain.is(point, Rain.WET)) return Biome.WOODLANDS
        if (rain.is(point, Rain.SEASONAL)) return Biome.SAVANNA

    }
    return Biome.DESERT
}