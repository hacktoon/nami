import { Grid } from '/src/lib/grid'

import { Relief } from './data'
import { RiverStretch } from '../river/data'
import { SeaSurface } from '../surface/data'


const TRENCH_RATIO = .65
const OCEAN_RATIO = .47
const PLATFORM_RATIO = .47
const MOUNTAIN_RATIO = .3


export class ReliefLayer {
    // Relief is related to large geologic features
    #grid

    constructor(rect, layers) {
        this.rect = rect
        this.#grid = Grid.fromRect(rect, point => {
            const isWater = layers.surface.isWater(point)
            const type = isWater ? this.#detectWaterType(layers, point)
                                 : this.#detectLandType(layers, point)
            return type.id
        })
    }

    #detectWaterType(layers, point) {
        const outlineNoise = layers.noise.get4D(this.rect, point, "outline")
        const featureNoise = layers.noise.get4D(this.rect, point, "feature")
        const grainedNoise = layers.noise.get4D(this.rect, point, "grained")
        if (layers.surface.get(point).id == SeaSurface.id) {
            if (featureNoise > OCEAN_RATIO) return Relief.OCEAN
            return Relief.PLATFORM
        }
        if (outlineNoise > PLATFORM_RATIO) return Relief.PLATFORM
        if (featureNoise > OCEAN_RATIO) return Relief.OCEAN
        if (grainedNoise > TRENCH_RATIO) return Relief.TRENCH
        return Relief.ABYSS
    }

    #detectLandType(layers, point) {
        const grainedNoise = layers.noise.get4D(this.rect, point, "grained")

        if (layers.basin.isOldBasin(point)) {
            if (layers.basin.isDivide(point) && grainedNoise < MOUNTAIN_RATIO) {
                return Relief.HILL
            }
            if (layers.surface.isBorder(point) && grainedNoise < MOUNTAIN_RATIO) {
                return Relief.MOUNTAIN
            }
            return Relief.PLAIN
        }
        if (! layers.river.hasWater(point)) {
            if (grainedNoise < MOUNTAIN_RATIO) return Relief.HILL
            return Relief.PLAIN
        }
        // is basin divide?
        if (layers.basin.isDivide(point)) {
            if (grainedNoise < MOUNTAIN_RATIO) return Relief.HILL
            return Relief.MOUNTAIN
        }
        const isHeadWaters = layers.river.is(point, RiverStretch.HEADWATERS)
        const isFastCourse = layers.river.is(point, RiverStretch.FAST_COURSE)
        // Set type according to river stretch.
        // Headwaters and fast courses will appear on hills
        if (isFastCourse || isHeadWaters) return Relief.HILL
        // all depositional and slow points of rivers parts are plains
        return Relief.PLAIN
    }

    get(point) {
        const id = this.#grid.get(point)
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
        const id = this.#grid.get(point)
        return id === type.id
    }

    draw(point, props, baseColor) {
        const relief = this.get(point)
        const color = baseColor.average(relief.color).toHex()
        relief.draw({...props, color, canvasPoint: props.canvasPoint})
    }
}
