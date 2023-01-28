import { Point } from '/src/lib/point'

import { Rain } from './data'


const SEASONAL_RATIO = .4
const DRY_RATIO = .6
const ARID_RATIO = .7


// TODO: rain is dynamic, make noise offset and loop

export class RainLayer {
    #noiseLayer

    constructor(noiseLayer) {
        this.#noiseLayer = noiseLayer
    }

    get(point) {
        const offset = 10
        const offsetPoint = Point.plus(point, [offset, offset])
        const noise = this.#noiseLayer.getOutline(offsetPoint)
        if (noise > SEASONAL_RATIO) {
            if (noise > DRY_RATIO) {
                if (noise > ARID_RATIO)
                    return Rain.ARID
                return Rain.DRY
            }
            return Rain.SEASONAL
        }
        return Rain.HUMID
    }

    isRiverSource(point) {
        const rain = this.get(point)
        return rain === Rain.HUMID || rain === Rain.SEASONAL
    }
}
