import { Matrix } from '/src/lib/matrix'
import { Random } from '/src/lib/random'
import { PointMap } from '/src/lib/point/map'

import { Landform } from './data'
import { Biome } from '../biome/data'
import { Relief } from '../relief/data'
import { Climate } from '../climate/data'


const LANDFORM_RATIO = .6


export class LandformLayer {
    // Landform is related to world feature and block layout
    #landforms = new PointMap()

    constructor(rect, layers) {
        Matrix.fromRect(rect, point => {
            const grainedNoise = layers.noise.getGrained(point)
            const isWater = layers.surface.isWater(point)
            const type = isWater ? this.#detectWaterType(layers, point)
                                 : this.#detectLandType(layers, point)
            if (type && grainedNoise > LANDFORM_RATIO) {
                this.#landforms.set(point, type.id)
            }
        })
    }

    #detectLandType(layers, point) {
        const isBorder = layers.surface.isBorder(point)

        // VOLCANO ---------------
        const isMountain = layers.relief.is(point, Relief.MOUNTAIN)
        if (isMountain) return Landform.VOLCANO

        // DUNES ---------------
        if (layers.biome.is(point, Biome.DESERT)) return Landform.DUNES

        // MESA ---------------
        const isMesa = layers.relief.is(point, Relief.PLATEAU)
        if (!isBorder && isMesa) return Landform.MESA

        // CANYON ---------------
        const isCanyon = layers.relief.is(point, Relief.HILL)
                      || layers.relief.is(point, Relief.PLATEAU)
        if (!isBorder && isCanyon) return Landform.CANYON

        // return Landform.RAVINE
        // return Landform.CRATER
        // NO LANDFORM
        return
    }

    #detectWaterType(layers, point) {
        const isBorder = layers.surface.isBorder(point)
        const isPlatform = layers.relief.is(point, Relief.PLATFORM)

        // HYDROTHERMAL VENTS ---------------
        if (layers.relief.is(point, Relief.TRENCH)) return Landform.HYDROTHERMAL_VENTS

        // ATOLS ---------------
        const isAtolClimate = layers.climate.is(point, Climate.HOT)
                           || layers.climate.is(point, Climate.WARM)
        if (!isBorder && isAtolClimate) return Landform.ATOL

        // ICEBERGS ---------------
        const isFrozen = layers.biome.is(point, Biome.ICECAP)
                      || layers.biome.is(point, Biome.TUNDRA)
        if (isFrozen) return Landform.ICEBERGS

        // SAND BARS ---------------
        const isSandBarClimate = ! layers.climate.is(point, Climate.FROZEN)
        if (isPlatform && isSandBarClimate) return Landform.SANDBARS

        // REEFS ---------------
        if (isPlatform) return Landform.REEFS

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

}
