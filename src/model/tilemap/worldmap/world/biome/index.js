import { Grid } from '/src/lib/grid'

import { Relief } from '../relief/data'
import { Climate } from '../climate/data'
import { Rain } from '../rain/data'

import { Biome } from './type'


const CORAL_NOISE = .7
const ICECAP_NOISE = .4


export class BiomeLayer {
    #grid

    constructor(context) {
        const {rect, world} = context
        this.rect = rect
        this.world = world
        this.#grid = this.buildBiomeGrid(context)
    }

    buildBiomeGrid(context) {
        const {rect, world} = context

        return Grid.fromRect(rect, point => {
            const isBorder = world.surface.isBorder(point)
            let biome = this.#buildBiome(point)

            if (world.surface.isWater(point)) {
                biome = Biome.OCEAN
            } else {

            }
            return biome.id
        })
    }

    #buildBiome(point) {
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

    #buildWaterBiome(point) {
        const world = this.world
        const grainedNoise = world.noise.get4DGrained(this.rect, point)
        const isFrozen = world.climate.is(point, Climate.FROZEN)
        if (isFrozen && grainedNoise > ICECAP_NOISE) {
            return Biome.ICECAP
        }
        if (world.relief.is(point, Relief.TRENCH)) return Biome.TRENCH
        if (world.relief.is(point, Relief.PLATFORM)) {
            const isReefTemp = world.climate.is(point, Climate.WARM)
                               || world.climate.is(point, Climate.HOT)
            const isReefNoise = grainedNoise > CORAL_NOISE
            const isBorder = world.surface.isBorder(point)
            if (!isBorder && isReefTemp && isReefNoise)
                return Biome.CORAL
            return Biome.SEA
        }
        return Biome.OCEAN
    }

    get(point) {
        let biomeId = this.#grid.get(point)
        return Biome.get(biomeId)
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

    draw(props, params) {
        const {canvas, canvasPoint, tileSize, tilePoint} = props
        let color = this.get(tilePoint).color
        canvas.rect(canvasPoint, tileSize, color.toHex())
    }
}
