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
        this.#matrix = Matrix.fromRect(rect, point => {
            let rain = Rain.HUMID
            const noise = layers.noise.getOutline(point)
            if (noise > WET_RATIO) rain = Rain.WET
            if (noise > SEASONAL_RATIO) rain = Rain.SEASONAL
            if (noise > DRY_RATIO) rain = Rain.DRY
            if (noise > ARID_RATIO) rain = Rain.ARID
            return rain.id
        })
    }

    get(point, offset=10) {
        const offsetPoint = Point.plus(point, [offset, offset])
        const rain = this.#matrix.get(offsetPoint)
        return Rain.fromId(rain)
    }

    isRiverSource(point) {
        const rain = this.get(point)
        return rain.id === Rain.HUMID.id || rain.id === Rain.SEASONAL.id
    }
}
