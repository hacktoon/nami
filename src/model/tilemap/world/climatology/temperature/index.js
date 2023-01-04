import { Temperature } from './data'


const TEMPERATE_RATIO = .3
const SUBTROPICAL_RATIO = .5
const TROPICAL_RATIO = .7


// TODO: temp is dynamic, make noise offset and loop

export class TemperatureLayer {
    #noiseLayer
    #surfaceLayer

    constructor(noiseLayer, surfaceLayer) {
        this.#noiseLayer = noiseLayer
        this.#surfaceLayer = surfaceLayer
    }

    #detectType(point) {
        const featureNoise = this.#noiseLayer.getFeature(point)

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
