import { Temperature } from './data'


const COLD_RATIO = .03
const TEMPERATE_RATIO = .2
const SUBTROPICAL_RATIO = .4
const TROPICAL_RATIO = .7


// TODO: temp is dynamic, make noise offset and loop

export class TemperatureLayer {
    #noiseLayer
    #reliefLayer

    constructor(rect, layers) {
        this.#noiseLayer = layers.noise
        this.#reliefLayer = layers.relief
    }

    #detectBaseType(point) {
        const featureNoise = this.#noiseLayer.getAtmos(point)
        if (featureNoise > COLD_RATIO) {
            if (featureNoise > TEMPERATE_RATIO) {
                if (featureNoise > SUBTROPICAL_RATIO) {
                    if (featureNoise > TROPICAL_RATIO)
                        return Temperature.TROPICAL
                    return Temperature.SUBTROPICAL
                }
                return Temperature.TEMPERATE
            }
            return Temperature.COLD
        }
        return Temperature.FROZEN
    }

    get(point) {
        const baseType = this.#detectBaseType(point)
        // TODO: decrease one temp if its a mountain
        if (this.#reliefLayer.isMountain(point)) {
            return Temperature.lower(baseType)
        }
        return baseType
    }

    isTropical(point) {
        const temp = this.get(point)
        return temp.id == Temperature.TROPICAL.id
    }

    isSubtropical(point) {
        const temp = this.get(point)
        return temp.id == Temperature.SUBTROPICAL.id
    }

    isTemperate(point) {
        const temp = this.get(point)
        return temp.id == Temperature.TEMPERATE.id
    }

    isFrozen(point) {
        const temp = this.get(point)
        return temp.id == Temperature.FROZEN.id
    }

    isCold(point) {
        const temp = this.get(point)
        return temp.id == Temperature.COLD.id
    }
}
