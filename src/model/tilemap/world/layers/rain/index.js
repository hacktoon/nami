import { Matrix } from '/src/lib/matrix'
import { Point } from '/src/lib/point'

import { Rain } from './data'


const WET_RATIO = .3
const SEASONAL_RATIO = .4
const DRY_RATIO = .55
const ARID_RATIO = .65


// TODO: rain is dynamic, make noise offset and loop

export class RainLayer {
    #matrix

    constructor(rect, layers) {
        const offset = [10, 10]
        this.#matrix = Matrix.fromRect(rect, point => {
            let rain = Rain.HUMID
            const offsetPoint = Point.plus(point, offset)
            const noise = layers.noise.getOutline(offsetPoint)
            if (noise > WET_RATIO) rain = Rain.WET
            if (noise > SEASONAL_RATIO) rain = Rain.SEASONAL
            if (noise > DRY_RATIO) rain = Rain.DRY
            if (noise > ARID_RATIO) rain = Rain.ARID
            return rain.id
        })
    }

    get(point) {
        const rain = this.#matrix.get(point)
        return Rain.get(rain)
    }

    getColor(point) {
        return this.get(point).color
    }

    createsRivers(point) {
        const rain = this.get(point)
        const riverSourceOpts = [Rain.HUMID.id, Rain.WET.id, Rain.SEASONAL.id]
        return riverSourceOpts.includes(rain.id)
    }

    is(point, type) {
        const id = this.#matrix.get(point)
        return id === type.id
    }

    getText(point) {
        const rain = this.get(point)
        return `Rain(${rain.name})`
    }
}
