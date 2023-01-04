import { Point } from '/src/lib/point'

import { Temperature } from './data'


const TEMPERATE_RATIO = .3
const SUBTROPICAL_RATIO = .5
const TROPICAL_RATIO = .7


// TODO: temp is dynamic, make noise offset and loop

export class TemperatureLayer {
    #offset
    #noiseLayer
    #surfaceLayer

    constructor(rect, noiseLayer, surfaceLayer) {
        this.#noiseLayer = noiseLayer
        this.#surfaceLayer = surfaceLayer
        this.#offset = [
            Math.floor(rect.width / 4),
            Math.floor(rect.height / 4)
        ]
    }

    #detectType(point) {
        const offsetPoint = Point.plus(point, this.#offset)
        const featureNoise = this.#noiseLayer.getOutline(offsetPoint)

        if (featureNoise > TEMPERATE_RATIO) {
            if (featureNoise > SUBTROPICAL_RATIO) {
                if (featureNoise > TROPICAL_RATIO)
                    return Temperature.TROPICAL
                return Temperature.SUBTROPICAL
            }
            return Temperature.TEMPERATE
        }
        return Temperature.POLAR
    }

    get(point) {
        return this.#detectType(point)
    }
}
