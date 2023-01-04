import { Temperature } from './data'


const TEMPERATE_RATIO = .3
const SUBTROPICAL_RATIO = .5
const TROPICAL_RATIO = .7


// TODO: temp is dynamic, make noise offset and loop

export class TemperatureLayer {
    #offset
    #noiseLayer
    #reliefLayer

    constructor(rect, noiseLayer, reliefLayer) {
        this.#noiseLayer = noiseLayer
        this.#reliefLayer = reliefLayer
        this.#offset = [
            Math.floor(rect.width / 4),
            Math.floor(rect.height / 4)
        ]
    }

    #detectType(point) {
        const featureNoise = this.#noiseLayer.getAtmos(point)

        // TODO: decrease one temp if its a mountain
        if (this.#reliefLayer.isMountain(point)) {
            return Temperature.POLAR
        }

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
