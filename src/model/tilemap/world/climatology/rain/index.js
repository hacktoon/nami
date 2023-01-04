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

    #detectBaseType(point) {
        const noise = this.#noiseLayer.getFeature(point)
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

    get(point) {
        const baseType = this.#detectBaseType(point)
        return baseType
    }
}
