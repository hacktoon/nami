import { Matrix } from '/src/lib/matrix'

import { Relief } from './data'
import { RiverStretch } from '../river/data'


const TRENCH_RATIO = .65
const OCEAN_RATIO = .47
const PLATFORM_RATIO = .47
const HILL_RATIO = .5
const MOUNTAIN_RATIO = .3
const PEAK_RATIO = .4


export class ReliefLayer {
    // Relief is related to large geologic features
    #matrix

    constructor(rect, layers) {
        this.#matrix = Matrix.fromRect(rect, point => {
            const isWater = layers.surface.isWater(point)
            const type = isWater ? this.#detectWaterType(layers, point)
                                 : this.#detectLandType(layers, point)
            return type.id
        })
    }

    #detectWaterType(layers, point) {
        // use noise to create water relief
        const outlineNoise = layers.noise.getOutline(point)
        const featureNoise = layers.noise.getFeature(point)
        const grainedNoise = layers.noise.getGrained(point)
        if (outlineNoise > PLATFORM_RATIO) return Relief.PLATFORM
        if (featureNoise > OCEAN_RATIO) return Relief.OCEAN
        if (grainedNoise > TRENCH_RATIO) return Relief.TRENCH
        return Relief.ABYSS
    }

    #detectLandType(layers, point) {
        const featureNoise = layers.noise.getFeature(point)
        const grainedNoise = layers.noise.getGrained(point)
        const isBorder = layers.surface.isBorder(point)
        const isPerennial = layers.river.isPerennial(point)

        if (isPerennial) {
            // is river source?
            if (layers.basin.isDivide(point)) {
                if (!isBorder && featureNoise > PEAK_RATIO) return Relief.PEAK
                return Relief.MOUNTAIN
            }
            // not a river source, set type according to river stretch
            const isHeadWaters = layers.river.is(point, RiverStretch.HEADWATERS)
            const isFastCourse = layers.river.is(point, RiverStretch.FAST_COURSE)
            const isBasinIdEven = layers.basin.get(point).id % 2 === 0
            // even id basins will set mountain on river headwaters
            if (isBasinIdEven && isHeadWaters) return Relief.MOUNTAIN
            // headwaters and fast courses will appear on hills
            if (isFastCourse || isHeadWaters) return Relief.HILL
            // all depositional and slow points of rives parts are plains
            const isSlowCourse = layers.river.is(point, RiverStretch.SLOW_COURSE)
            const isDepositional = layers.river.is(point, RiverStretch.DEPOSITIONAL)
            if (isDepositional || isSlowCourse) return Relief.PLAIN
        }
        // not on a river, try adding more plateaus or hills
        if (grainedNoise < MOUNTAIN_RATIO) return Relief.MOUNTAIN
        if (grainedNoise < HILL_RATIO) return Relief.HILL
        return Relief.PLAIN
    }

    get(point) {
        const id = this.#matrix.get(point)
        return Relief.get(id)
    }

    getText(point) {
        const relief = this.get(point)
        return `Relief(${relief.name})`
    }

    getColor(point) {
        return this.get(point).color
    }

    is(point, type) {
        const id = this.#matrix.get(point)
        return id === type.id
    }

    draw(point, props, baseColor) {
        const relief = this.get(point)
        const color = baseColor.average(relief.color).toHex()
        relief.draw({...props, color, canvasPoint: props.canvasPoint})
    }
}
