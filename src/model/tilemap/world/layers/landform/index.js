import { Matrix } from '/src/lib/matrix'
import { Random } from '/src/lib/random'
import { PointMap } from '/src/lib/point/map'

import { Landform } from './data'
import { Biome } from '../biome/data'
import { Relief } from '../relief/data'
import { Surface } from '../surface/data'
import { Climate } from '../climate/data'
import { RiverStretch } from '../river/data'


// LAND
const VOLCANO_CHANCE = .08
const DUNE_CHANCE = .8
const MESA_CHANCE = .1
const CANYON_CHANCE = .2

// WATER
const ATOL_CHANCE = .2
const VENTS_CHANCE = .2
const ICEBERG_CHANCE = .6
const SANDBAR_CHANCE = .1


export class LandformLayer {
    // Landform is related to world feature and block layout
    #landforms = new PointMap()

    constructor(rect, layers) {
        Matrix.fromRect(rect, point => {
            const isWater = layers.surface.isWater(point)
            const type = isWater ? this.#detectWaterType(layers, point)
                                 : this.#detectLandType(layers, point)
            if (type) {
                this.#landforms.set(point, type.id)
            }
        })
    }

    #detectLandType(layers, point) {
        const isBorder = layers.surface.isBorder(point)
        const isRiver = layers.river.has(point)
        const isHill = layers.relief.is(point, Relief.HILL)
        const isPlateau = layers.relief.is(point, Relief.PLATEAU)
        const isMountain = layers.relief.is(point, Relief.MOUNTAIN)

        // VOLCANO ---------------
        if (Random.chance(VOLCANO_CHANCE) && isMountain) {
            return Landform.VOLCANO
        }

        // DUNES ---------------
        if (Random.chance(DUNE_CHANCE)) {
            const isDesert = layers.biome.is(point, Biome.DESERT)
            if (isDesert && ! isMountain && ! isPlateau) return Landform.DUNES
        }

        // CANYON ---------------
        if (Random.chance(CANYON_CHANCE) && !isBorder) {
            const isDivide = layers.basin.isDivide(point)
            const isHeadWaters = layers.river.is(point, RiverStretch.HEADWATERS)
            if (!isDivide && isHeadWaters && isPlateau) return Landform.CANYON
        }

        // MESA ---------------
        if (Random.chance(MESA_CHANCE)) {
            const isMesa = (isPlateau || isHill) && !isBorder && !isRiver
            if (isMesa) return Landform.MESA
        }

        // NO LANDFORM
        return
    }

    #detectWaterType(layers, point) {
        const isBorder = layers.surface.isBorder(point)
        const isPlatform = layers.relief.is(point, Relief.PLATFORM)
        const isCoral = layers.biome.is(point, Biome.CORAL)

        // HYDROTHERMAL VENTS ---------------
        if (Random.chance(VENTS_CHANCE)) {
            const isOcean = layers.surface.is(point, Surface.OCEAN)
            if (isOcean && layers.relief.is(point, Relief.TRENCH))
                return Landform.HYDROTHERMAL_VENTS
        }

        // ATOLS ---------------
        if (Random.chance(ATOL_CHANCE)) {
            if (!isBorder && isCoral) return Landform.ATOL
        }
        if (isCoral) return Landform.REEFS

        // ICEBERGS ---------------
        if (Random.chance(ICEBERG_CHANCE)) {
            const isFrozen = layers.biome.is(point, Biome.ICECAP)
                          || layers.biome.is(point, Biome.TUNDRA)
            if (isFrozen) return Landform.ICEBERGS
        }

        // SANDBARS ---------------
        if (Random.chance(SANDBAR_CHANCE)) {
            const isSandBarClimate = ! layers.climate.is(point, Climate.FROZEN)
            if (isPlatform && isSandBarClimate) return Landform.SANDBARS
        }

        // NO LANDFORM
        return
    }

    has(point) {
        return this.#landforms.has(point)
    }

    get(point) {
        const id = this.#landforms.get(point)
        return Landform.get(id)
    }

    is(point, type) {
        const id = this.#landforms.get(point)
        return id === type.id
    }

    getText(point) {
        if (this.#landforms.has(point)) {
            const landform = this.get(point)
            return `Landform(${landform.name})`
        }
        return ''
    }

    draw(point, props) {
        const landform = this.get(point)
        const {canvas, canvasPoint, tileSize} = props
        canvas.rect(canvasPoint, tileSize, landform.color.toHex())
    }
}
