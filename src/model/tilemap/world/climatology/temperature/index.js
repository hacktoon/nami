import { Matrix } from '/src/lib/matrix'
import { Temperature } from './data'


const COLD_RATIO = .03
const TEMPERATE_RATIO = .2
const WARM_RATIO = .4
const HOT_RATIO = .7


// TODO: temp is dynamic, make noise offset and loop

export class TemperatureLayer {
    #matrix

    constructor(rect, layers) {
        this.#matrix = Matrix.fromRect(rect, point => {
            let temp = Temperature.FROZEN
            const featureNoise = layers.noise.getAtmos(point)
            const isMountain = layers.relief.isMountain(point)
            if (featureNoise > COLD_RATIO) temp = Temperature.COLD
            if (featureNoise > TEMPERATE_RATIO) temp = Temperature.TEMPERATE
            if (featureNoise > WARM_RATIO) temp = Temperature.WARM
            if (featureNoise > HOT_RATIO) temp = Temperature.HOT
            if (isMountain) return Temperature.lower(temp).id
            return temp.id
        })
    }

    get(point) {
        const temperature = this.#matrix.get(point)
        return Temperature.fromId(temperature)
    }
}
