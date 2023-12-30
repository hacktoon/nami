import { Matrix } from '/src/lib/matrix'

import { Relief } from './data'
import { RiverStretch } from '../river/data'


const TRENCH_RATIO = .65
const OCEAN_RATIO = .47
const PLATFORM_RATIO = .47
const MOUNTAIN_RATIO = .3


export class ReliefLayer {
    // Relief is related to large geologic features
    #matrix

    constructor(rect, layers) {
        this.rect = rect
        this.#matrix = Matrix.fromRect(rect, point => {
            const isWater = layers.surface.isWater(point)
            const type = isWater ? this.#detectWaterType(layers, point)
                                 : this.#detectLandType(layers, point)
            return type.id
        })
    }

    #detectWaterType(layers, point) {
        return Relief.ABYSS
    }

    #detectLandType(layers, point) {
        if (! layers.river.hasWater(point)) {
            return Relief.PLAIN
        }
        const grainedNoise = layers.noise.get4D(this.rect, point, "grained")
        const isHeadWaters = layers.river.is(point, RiverStretch.HEADWATERS)
        const isFastCourse = layers.river.is(point, RiverStretch.FAST_COURSE)
        const isDivide = layers.basin.isDivide(point)
        // is basin divide?
        if (isDivide) {
            if (grainedNoise < MOUNTAIN_RATIO) return Relief.HILL
            return Relief.MOUNTAIN
        }
        // Set type according to river stretch.
        // Headwaters and fast courses will appear on hills
        if (isFastCourse || isHeadWaters) return Relief.HILL
        // all depositional and slow points of rivers parts are plains
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
